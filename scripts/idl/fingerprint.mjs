import fs from "node:fs";
import crypto from "node:crypto";

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, normalize(value[key])]),
    );
  }
  return value;
}
const canonicalJson = (value) => JSON.stringify(normalize(value));
const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const anchor = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_lock.expected.json", "utf8"),
);
const sui = JSON.parse(
  fs.readFileSync("idl/sui/wpwrc.interface.json", "utf8"),
);

const anchorExpectedSha256 = sha256(canonicalJson(anchor));
const suiSourceInterfaceSha256 = sha256(canonicalJson(sui));
const combinedAbiSha256 = sha256(
  ["POWERCHAIN_IDL_ABI_V1", anchorExpectedSha256, suiSourceInterfaceSha256]
    .join("\0"),
);

const result = {
  version: "1.0.0",
  algorithm: "sha256",
  domain: "POWERCHAIN_IDL_ABI_V1",
  anchorExpectedSha256,
  suiSourceInterfaceSha256,
  combinedAbiSha256,
};
fs.writeFileSync(
  "idl/abi.fingerprint.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
