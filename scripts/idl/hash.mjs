import fs from "node:fs";
import crypto from "node:crypto";

const files = [
  "idl/manifest.json",
  "idl/anchor/pwrc_lock.expected.json",
  "idl/schemas/pwrc_lock.anchor.schema.json",
  "idl/sui/wpwrc.interface.json",
  "idl/abi.fingerprint.json",
  "programs/pwrc-lock/src/lib.rs",
  "contracts/wpwrc/sources/wpwrc.move",
  "contracts/wpwrc/sources/bridge.move",
].filter(fs.existsSync);

const hashes = {};
for (const file of files) {
  hashes[file] = crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

const result = {
  version: "1.0.0",
  algorithm: "sha256",
  files: hashes,
};
fs.writeFileSync(
  "idl/manifest.sha256.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
