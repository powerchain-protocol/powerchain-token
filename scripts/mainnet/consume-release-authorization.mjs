import fs from "node:fs";
import crypto from "node:crypto";
import {
  spawnSync,
} from "node:child_process";

const confirmation =
  process.env[
    "PWRC_RELEASE_CONSUMPTION_CONFIRMATION"
  ];

if (
  confirmation !==
    "PWRC-1.0.0-CONSUME-AUTHORIZATION"
) {
  throw new Error(
    "PWRC_RELEASE_CONSUMPTION_CONFIRMATION_REQUIRED",
  );
}

const consumedBy =
  process.env[
    "PWRC_RELEASE_CONSUMED_BY"
  ]?.trim();

if (!consumedBy) {
  throw new Error(
    "PWRC_RELEASE_CONSUMED_BY_REQUIRED",
  );
}

for (const script of [
  "scripts/mainnet/verify-build-manifest.mjs",
  "scripts/mainnet/verify-evidence.mjs",
  "scripts/mainnet/verify-release-authorization.mjs",
]) {
  const result =
    spawnSync(
      process.execPath,
      [
        script,
      ],
      {
        encoding:
          "utf8",
      },
    );

  if (result.status !== 0) {
    process.stderr.write(
      result.stdout ??
      "",
    );
    process.stderr.write(
      result.stderr ??
      "",
    );
    throw new Error(
      `PWRC_RELEASE_PREREQUISITE_FAILED:${script}`,
    );
  }
}

const output =
  "config/mainnet/release-consumption.json";

if (fs.existsSync(output)) {
  throw new Error(
    "PWRC_RELEASE_AUTHORIZATION_ALREADY_CONSUMED",
  );
}

function sha256(path) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path))
    .digest("hex");
}

const receipt = {
  version:
    "1.0.0",
  release:
    "powerchain-token-1.0.0",
  authorizationSha256:
    sha256(
      "config/mainnet/release-authorization.json",
    ),
  evidenceSha256:
    sha256(
      "config/mainnet/evidence.json",
    ),
  buildManifestSha256:
    sha256(
      "reports/mainnet-build-manifest.json",
    ),
  consumedAt:
    new Date()
      .toISOString(),
  consumedBy,
  confirmation:
    "PWRC-1.0.0-CONSUME-AUTHORIZATION",
};

fs.writeFileSync(
  output,
  `${JSON.stringify(receipt, null, 2)}\n`,
  {
    flag:
      "wx",
  },
);

console.log(
  JSON.stringify(
    receipt,
    null,
    2,
  ),
);
