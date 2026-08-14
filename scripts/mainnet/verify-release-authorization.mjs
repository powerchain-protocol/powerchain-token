import fs from "node:fs";
import crypto from "node:crypto";

const file =
  "config/mainnet/release-authorization.json";
const failures = [];

function sha256File(
  path,
) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(path),
    )
    .digest("hex");
}

if (!fs.existsSync(file)) {
  failures.push(
    `missing:${file}`,
  );
} else {
  let authorization;

  try {
    authorization =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "authorization:invalid-json",
    );
  }

  if (authorization) {
    if (
      authorization.version !==
        "1.0.0" ||
      authorization.release !==
        "powerchain-token-1.0.0"
    ) {
      failures.push(
        "authorization:identity",
      );
    }

    for (const field of [
      "evidenceSha256",
      "buildManifestSha256",
    ]) {
      if (
        !/^[a-f0-9]{64}$/i.test(
          authorization[field] ??
            "",
        )
      ) {
        failures.push(
          `authorization:${field}`,
        );
      }
    }

    const evidenceFile =
      "config/mainnet/evidence.json";
    const buildFile =
      "reports/mainnet-build-manifest.json";

    if (
      fs.existsSync(
        evidenceFile,
      ) &&
      /^[a-f0-9]{64}$/i.test(
        authorization.evidenceSha256 ??
          "",
      ) &&
      sha256File(
        evidenceFile,
      ) !==
        authorization.evidenceSha256
          .toLowerCase()
    ) {
      failures.push(
        "authorization:evidenceSha256:mismatch",
      );
    }

    if (
      fs.existsSync(
        buildFile,
      ) &&
      /^[a-f0-9]{64}$/i.test(
        authorization.buildManifestSha256 ??
          "",
      ) &&
      sha256File(
        buildFile,
      ) !==
        authorization.buildManifestSha256
          .toLowerCase()
    ) {
      failures.push(
        "authorization:buildManifestSha256:mismatch",
      );
    }

    if (
      !fs.existsSync(
        evidenceFile,
      )
    ) {
      failures.push(
        "authorization:evidence-file-required",
      );
    }

    if (
      !fs.existsSync(
        buildFile,
      )
    ) {
      failures.push(
        "authorization:build-manifest-required",
      );
    }

    const authorizedAt =
      Date.parse(
        authorization.authorizedAt ??
          "",
      );
    const expiresAt =
      Date.parse(
        authorization.expiresAt ??
          "",
      );

    if (
      !Number.isFinite(
        authorizedAt,
      ) ||
      !Number.isFinite(
        expiresAt,
      ) ||
      expiresAt <=
        authorizedAt ||
      expiresAt <=
        Date.now()
    ) {
      failures.push(
        "authorization:time-window",
      );
    }

    if (
      authorization.consumedAt !==
        null
    ) {
      failures.push(
        "authorization:already-consumed",
      );
    }

    if (
      !Array.isArray(
        authorization.approvers,
      ) ||
      authorization.approvers.length <
        1
    ) {
      failures.push(
        "authorization:approvers",
      );
    }

    if (
      !Array.isArray(
        authorization.signatureEvidence,
      ) ||
      authorization.signatureEvidence.length <
        1
    ) {
      failures.push(
        "authorization:signature-evidence",
      );
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  authorizationBoundToEvidence:
    true,
  authorizationBoundToBuild:
    true,
  failures,
};

fs.mkdirSync(
  "reports",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  "reports/release-authorization-verification.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}
