import fs from "node:fs";

const failures = [];
const fingerprint = JSON.parse(
  fs.readFileSync("idl/abi.fingerprint.json", "utf8"),
);
const mainnet = JSON.parse(
  fs.readFileSync("config/mainnet/bridge.json", "utf8"),
);

if (mainnet.abi?.version !== "1.0.0") {
  failures.push("mainnet:abi-version");
}
if (
  mainnet.abi?.combinedSha256 !==
  fingerprint.combinedAbiSha256
) {
  failures.push("mainnet:abi-fingerprint");
}
if (mainnet.abi?.generatedAnchorIdlRequired !== true) {
  failures.push("mainnet:anchor-idl-policy");
}
if (mainnet.abi?.suiNormalizedModulesRequired !== true) {
  failures.push("mainnet:sui-normalized-policy");
}
if (
  mainnet.abi?.generatedTokenVerifierIdlRequired !== true
) {
  failures.push(
    "mainnet:token-verifier-idl-policy",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  abiFingerprint: fingerprint.combinedAbiSha256,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
