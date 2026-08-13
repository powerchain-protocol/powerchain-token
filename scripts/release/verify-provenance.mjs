import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { atomicWriteJsonSync } from "../lib/atomic-json.mjs";

const file = "reports/release-provenance.json";
const failures = [];

if (!fs.existsSync(file)) {
  failures.push("provenance:missing");
}

const EXCLUDED = new Set([
  "node_modules", ".git", "reports", "dist",
  ".next", ".turbo", ".cache", "coverage", "target",
]);

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

function currentTreeHash() {
  const hash = crypto.createHash("sha256");
  for (const source of walk(".")) {
    hash.update(source.replace(/^\.\//, ""));
    hash.update("\0");
    hash.update(fs.readFileSync(source));
    hash.update("\0");
  }
  return hash.digest("hex");
}

if (!failures.length) {
  const evidence = JSON.parse(fs.readFileSync(file, "utf8"));
  const { generatedAt, payloadSha256, ...payload } = evidence;
  const actualPayloadSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  if (payloadSha256 !== actualPayloadSha256) {
    failures.push("provenance:payload-hash-mismatch");
  }

  if (payload.sourceTreeSha256 !== currentTreeHash()) {
    failures.push("provenance:source-tree-stale");
  }

  if (payload.version !== "1.0.0") {
    failures.push("provenance:version");
  }
}

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  failures,
};

atomicWriteJsonSync(
  "reports/release-provenance-verification.json",
  result,
);

console.log(JSON.stringify(result, null, 2));

if (failures.length) process.exit(1);
