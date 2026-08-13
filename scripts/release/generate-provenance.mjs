import fs from "node:fs";
import crypto from "node:crypto";
import {
  sha256FileSync,
} from "../../packages/runtime/src/crypto.mjs";
import {
  normalizeRepositoryPath,
} from "../../packages/runtime/src/paths.mjs";
import path from "node:path";
import { atomicWriteJsonSync } from "../lib/atomic-json.mjs";

const EXCLUDED = new Set([
  "node_modules",
  ".git",
  "reports",
  "dist",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  "target",
]);

function sha256File(file) {
  return sha256FileSync(file);
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (EXCLUDED.has(name)) continue;

    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function sourceTreeSha256() {
  const hash = crypto.createHash("sha256");
  for (const file of walk(".")) {
    hash.update(file.replace(/^\.\//, ""));
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

const required = {
  packageJsonSha256: "package.json",
  tokenConfigSha256: "config/token.json",
  bridgeConfigSha256: "config/bridge.json",
  mainnetConfigSha256: "config/mainnet/bridge.json",
  suiMovePackageSha256: "contracts/wpwrc/sources/wpwrc.move",
  suiBridgeModuleSha256: "contracts/wpwrc/sources/bridge.move",
  solanaLockProgramSha256: "programs/pwrc-lock/src/lib.rs",
  solanaTokenVerifierSha256: "programs/token/src/lib.rs",
  nativeClientPackageSha256: "packages/native-token-client/package.json",
  bridgeIntegrationPackageSha256: "packages/bridge-integration/package.json",
  metadataSha256: "metadata/metadata.json",
  wrappedMetadataSha256: "metadata/wpwrc.metadata.json",
  changelogSha256: "CHANGELOG.md",
};

const payload = {
  version: "1.0.0",
  sourceTreeSha256: sourceTreeSha256(),
};

for (const [key, file] of Object.entries(required)) {
  if (!fs.existsSync(file)) {
    throw new Error(`PROVENANCE_REQUIRED_FILE_MISSING:${file}`);
  }
  payload[key] = sha256File(file);
}

const payloadSha256 = crypto
  .createHash("sha256")
  .update(JSON.stringify(payload))
  .digest("hex");

const evidence = {
  ...payload,
  payloadSha256,
  generatedAt: new Date().toISOString(),
};

atomicWriteJsonSync("reports/release-provenance.json", evidence);
console.log(JSON.stringify(evidence, null, 2));
