import fs from "node:fs";

const failures = [];
const manifest = JSON.parse(
  fs.readFileSync("idl/bindings/manifest.json", "utf8"),
);
const anchor = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_lock.expected.json", "utf8"),
);
const sui = JSON.parse(
  fs.readFileSync("idl/sui/wpwrc.interface.json", "utf8"),
);
const fingerprint = JSON.parse(
  fs.readFileSync("idl/abi.fingerprint.json", "utf8"),
);

if (manifest.version !== "1.0.0") failures.push("binding:version");
if (
  manifest.abiFingerprint !==
  fingerprint.combinedAbiSha256
) {
  failures.push("binding:fingerprint");
}

const anchorExpected =
  anchor.instructions.map((item) => item.name);
if (
  JSON.stringify(manifest.anchor.instructions) !==
  JSON.stringify(anchorExpected)
) {
  failures.push("binding:anchor-instructions");
}

if (
  JSON.stringify(manifest.sui.entryFunctions) !==
  JSON.stringify(sui.modules.bridge.entryFunctions)
) {
  failures.push("binding:sui-entry-functions");
}

if (
  manifest.anchor.generatedIdlRequiredForEncoding !== true
) {
  failures.push("binding:anchor-generated-idl-policy");
}
if (
  manifest.sui.verifiedPackageIdRequiredForExecution !== true
) {
  failures.push("binding:sui-package-policy");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  abiFingerprint: manifest.abiFingerprint,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
