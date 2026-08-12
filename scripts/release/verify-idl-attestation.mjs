import fs from "node:fs";
import crypto from "node:crypto";

const file =
  "idl/attestations/1.0.0.unsigned.json";

const failures = [];

if (!fs.existsSync(file)) {
  failures.push("attestation:missing");
}

let storedHash = null;
let calculatedHash = null;

if (!failures.length) {
  const data = JSON.parse(
    fs.readFileSync(file, "utf8"),
  );

  storedHash = data.payloadSha256 ?? null;

  const {
    payloadSha256,
    signature,
    signer,
    ...payload
  } = data;

  const canonical =
    JSON.stringify(payload, null, 2) + "\n";

  calculatedHash = crypto
    .createHash("sha256")
    .update(canonical)
    .digest("hex");

  if (storedHash !== calculatedHash) {
    failures.push(
      "attestation:payload-hash-mismatch",
    );
  }

  if (data.version !== "1.0.0") {
    failures.push("attestation:version");
  }

  if (data.signed !== false) {
    failures.push(
      "attestation:unexpected-signed-state",
    );
  }

  if (
    signature !== null ||
    signer !== null
  ) {
    failures.push(
      "attestation:unsigned-fields-invalid",
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  storedHash,
  calculatedHash,
  signed: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
