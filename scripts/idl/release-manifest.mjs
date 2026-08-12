import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function requireOkReport(file, label) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
    return null;
  }

  const report = JSON.parse(
    fs.readFileSync(file, "utf8"),
  );

  if (!report.ok) {
    failures.push(`${label}:failed`);
  }

  return report;
}

const requiredSourceFiles = [
  "idl/manifest.json",
  "idl/abi.fingerprint.json",
  "idl/anchor/pwrc_lock.expected.json",
  "idl/sui/wpwrc.interface.json",
  "idl/baseline/1.0.0.json",
  "idl/baseline/1.0.0.sha256",
  "idl/bindings/manifest.json",
];

for (const file of requiredSourceFiles) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
  }
}

const drift =
  requireOkReport(
    "reports/idl-source-drift.json",
    "source-drift",
  );

const compatibility =
  requireOkReport(
    "reports/idl-compatibility.json",
    "compatibility",
  );

const generatedVerification =
  requireOkReport(
    "reports/idl-generated-verification.json",
    "generated-anchor-idl",
  );

const anchorIdl =
  "idl/generated/pwrc_lock.json";
const suiNormalized =
  "idl/generated/wpwrc.modules.json";

const anchorPresent =
  fs.existsSync(anchorIdl);
const suiPresent =
  fs.existsSync(suiNormalized);

if (!anchorPresent) {
  failures.push(
    "generated Anchor IDL missing",
  );
}

if (!suiPresent) {
  failures.push(
    "normalized Sui modules missing",
  );
}

let suiNormalizedSha256 = null;
if (suiPresent) {
  suiNormalizedSha256 =
    sha256(suiNormalized);
}

const fingerprint = JSON.parse(
  fs.readFileSync(
    "idl/abi.fingerprint.json",
    "utf8",
  ),
);

const release = {
  version: "1.0.0",
  status:
    failures.length === 0
      ? "release-idl-ready"
      : "blocked",
  abi: {
    domain: fingerprint.domain,
    combinedAbiSha256:
      fingerprint.combinedAbiSha256,
  },
  anchor: {
    expectedSha256:
      sha256(
        "idl/anchor/pwrc_lock.expected.json",
      ),
    generatedPresent:
      anchorPresent,
    generatedSha256:
      anchorPresent
        ? sha256(anchorIdl)
        : null,
    generatedVerification:
      generatedVerification?.ok === true,
  },
  sui: {
    sourceInterfaceSha256:
      sha256(
        "idl/sui/wpwrc.interface.json",
      ),
    normalizedModulesPresent:
      suiPresent,
    normalizedModulesSha256:
      suiNormalizedSha256,
  },
  source: {
    pwrcLockSha256:
      sha256(
        "programs/pwrc-lock/src/lib.rs",
      ),
    wpwrcSha256:
      sha256(
        "contracts/wpwrc/sources/wpwrc.move",
      ),
    bridgeSha256:
      sha256(
        "contracts/wpwrc/sources/bridge.move",
      ),
  },
  checks: {
    sourceDrift:
      drift?.ok === true,
    compatibility:
      compatibility?.ok === true,
  },
  failures,
};

fs.mkdirSync("idl/release", {
  recursive: true,
});
fs.writeFileSync(
  "idl/release/1.0.0.json",
  `${JSON.stringify(release, null, 2)}\n`,
);

console.log(
  JSON.stringify(release, null, 2),
);

if (failures.length) {
  process.exit(2);
}
