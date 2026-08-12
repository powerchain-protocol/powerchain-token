import fs from "node:fs";
import crypto from "node:crypto";

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

const fingerprint = JSON.parse(
  fs.readFileSync("idl/abi.fingerprint.json", "utf8"),
);
const compatibility = JSON.parse(
  fs.readFileSync("reports/idl-compatibility.json", "utf8"),
);
const drift = JSON.parse(
  fs.readFileSync("reports/idl-source-drift.json", "utf8"),
);
const classification = JSON.parse(
  fs.readFileSync("reports/idl-change-classification.json", "utf8"),
);

if (!compatibility.ok || !drift.ok || classification.classification === "breaking") {
  throw new Error("PWRC_IDL_ATTESTATION_PRECONDITION_FAILED");
}

const payload = {
  version: "1.0.0",
  type: "powerchain-idl-release-attestation",
  signed: false,
  abi: {
    domain: fingerprint.domain,
    combinedSha256: fingerprint.combinedAbiSha256,
  },
  source: {
    pwrcLockSha256: sha256("programs/pwrc-lock/src/lib.rs"),
    wpwrcSha256: sha256("contracts/wpwrc/sources/wpwrc.move"),
    bridgeSha256: sha256("contracts/wpwrc/sources/bridge.move"),
  },
  interfaces: {
    anchorExpectedSha256:
      sha256("idl/anchor/pwrc_lock.expected.json"),
    suiSourceInterfaceSha256:
      sha256("idl/sui/wpwrc.interface.json"),
    bindingManifestSha256:
      sha256("idl/bindings/manifest.json"),
  },
  compatibility: {
    classification: classification.classification,
    breaking: classification.breaking,
    additive: classification.additive,
  },
  generatedArtifacts: {
    anchorIdlPresent:
      fs.existsSync("idl/generated/pwrc_lock.json"),
    suiNormalizedModulesPresent:
      fs.existsSync("idl/generated/wpwrc.modules.json"),
  },
};

const canonical = JSON.stringify(payload, null, 2) + "\n";
const payloadSha256 = crypto
  .createHash("sha256")
  .update(canonical)
  .digest("hex");

const output = {
  ...payload,
  payloadSha256,
  signature: null,
  signer: null,
};

fs.mkdirSync("idl/attestations", { recursive: true });
fs.writeFileSync(
  "idl/attestations/1.0.0.unsigned.json",
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(JSON.stringify({
  ok: true,
  version: "1.0.0",
  payloadSha256,
  signed: false,
}, null, 2));
