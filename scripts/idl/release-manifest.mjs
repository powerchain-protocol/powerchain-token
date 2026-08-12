import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(file),
    )
    .digest("hex");
}

function requireOkReport(
  file,
  label,
) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
    return null;
  }

  const report =
    JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );

  if (!report.ok) {
    failures.push(
      `${label}:failed`,
    );
  }

  return report;
}

for (const file of [
  "idl/manifest.json",
  "idl/abi.fingerprint.json",
  "idl/anchor/pwrc_lock.expected.json",
  "idl/anchor/pwrc_token.expected.json",
  "idl/sui/wpwrc.interface.json",
  "idl/baseline/1.0.0.json",
  "idl/baseline/1.0.0.sha256",
  "idl/bindings/manifest.json",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
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

const lockIdl =
  "idl/generated/pwrc_lock.json";
const tokenIdl =
  "idl/generated/pwrc_token.json";
const suiNormalized =
  "idl/generated/wpwrc.modules.json";

const lockPresent =
  fs.existsSync(lockIdl);
const tokenPresent =
  fs.existsSync(tokenIdl);
const suiPresent =
  fs.existsSync(
    suiNormalized,
  );

if (!lockPresent) {
  failures.push(
    "generated pwrc_lock Anchor IDL missing",
  );
}
if (!tokenPresent) {
  failures.push(
    "generated pwrc_token Anchor IDL missing",
  );
}
if (!suiPresent) {
  failures.push(
    "normalized Sui modules missing",
  );
}

const fingerprint =
  JSON.parse(
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
    domain:
      fingerprint.domain,
    combinedAbiSha256:
      fingerprint
        .combinedAbiSha256,
  },
  anchor: {
    pwrcLock: {
      expectedSha256:
        sha256(
          "idl/anchor/pwrc_lock.expected.json",
        ),
      generatedPresent:
        lockPresent,
      generatedSha256:
        lockPresent
          ? sha256(lockIdl)
          : null,
    },
    pwrcToken: {
      expectedSha256:
        sha256(
          "idl/anchor/pwrc_token.expected.json",
        ),
      generatedPresent:
        tokenPresent,
      generatedSha256:
        tokenPresent
          ? sha256(tokenIdl)
          : null,
    },
    generatedVerification:
      generatedVerification
        ?.ok === true,
  },
  sui: {
    sourceInterfaceSha256:
      sha256(
        "idl/sui/wpwrc.interface.json",
      ),
    normalizedModulesPresent:
      suiPresent,
    normalizedModulesSha256:
      suiPresent
        ? sha256(
            suiNormalized,
          )
        : null,
  },
  source: {
    pwrcLockSha256:
      sha256(
        "programs/pwrc-lock/src/lib.rs",
      ),
    pwrcTokenSha256:
      sha256(
        "programs/token/src/lib.rs",
      ),
    pwrcTokenInvariantsSha256:
      sha256(
        "programs/token/src/invariants.rs",
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

fs.mkdirSync(
  "idl/release",
  {
    recursive: true,
  },
);

fs.writeFileSync(
  "idl/release/1.0.0.json",
  `${JSON.stringify(
    release,
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    release,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}
