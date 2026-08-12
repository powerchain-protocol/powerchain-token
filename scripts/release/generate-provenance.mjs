import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

function sha256File(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (
      ["node_modules", ".git", "reports", "dist"].includes(
        name,
      )
    ) {
      continue;
    }

    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const treeHash = crypto.createHash("sha256");
for (const file of walk(".")) {
  treeHash.update(file.replace(/^\.\//, ""));
  treeHash.update("\0");
  treeHash.update(fs.readFileSync(file));
  treeHash.update("\0");
}

const required = {
  packageJsonSha256: "package.json",
  tokenConfigSha256: "config/token.json",
  bridgeConfigSha256: "config/bridge.json",
  mainnetConfigSha256: "config/mainnet/bridge.json",
  suiMovePackageSha256:
    "contracts/wpwrc/sources/wpwrc.move",
  suiBridgeModuleSha256:
    "contracts/wpwrc/sources/bridge.move",
  solanaLockProgramSha256:
    "programs/pwrc-lock/src/lib.rs",
  nativeClientPackageSha256:
    "packages/native-token-client/package.json",
  bridgeIntegrationPackageSha256:
    "packages/bridge-integration/package.json",
  metadataSha256:
    "metadata/metadata.json",
  wrappedMetadataSha256:
    "metadata/wpwrc.metadata.json",
  changelogSha256:
    "CHANGELOG.md",
};

const evidence = {
  version: "1.0.0",
  sourceTreeSha256:
    treeHash.digest("hex"),
  generatedAt:
    new Date().toISOString(),
};

for (const [key, file] of Object.entries(required)) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `PROVENANCE_REQUIRED_FILE_MISSING:${file}`,
    );
  }
  evidence[key] = sha256File(file);
}

fs.mkdirSync("reports", {
  recursive: true,
});
fs.writeFileSync(
  "reports/release-provenance.json",
  `${JSON.stringify(evidence, null, 2)}\n`,
);

console.log(JSON.stringify(evidence, null, 2));
