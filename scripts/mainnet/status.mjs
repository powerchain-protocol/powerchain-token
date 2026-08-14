import fs from "node:fs";
import {
  spawnSync,
} from "node:child_process";

const requiredBuild = [
  "pnpm-lock.yaml",
  "Cargo.lock",
  "contracts/wpwrc/Move.lock",
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
  "reports/mainnet-build-manifest.json",
];

const missing =
  requiredBuild.filter(
    (file) =>
      !fs.existsSync(file),
  );

function verify(
  file,
  script,
) {
  if (!fs.existsSync(file)) {
    return false;
  }

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

  return result.status ===
    0;
}

const buildManifestReady =
  verify(
    "reports/mainnet-build-manifest.json",
    "scripts/mainnet/verify-build-manifest.mjs",
  );

const evidenceReady =
  verify(
    "config/mainnet/evidence.json",
    "scripts/mainnet/verify-evidence.mjs",
  );

const authorizationReady =
  verify(
    "config/mainnet/release-authorization.json",
    "scripts/mainnet/verify-release-authorization.mjs",
  );

const consumptionReady =
  verify(
    "config/mainnet/release-consumption.json",
    "scripts/mainnet/verify-release-consumption.mjs",
  );

const buildReady =
  missing.length === 0 &&
  buildManifestReady;

const releaseState =
  consumptionReady &&
  authorizationReady &&
  evidenceReady &&
  buildReady
    ? "CONSUMED"
    : authorizationReady &&
      evidenceReady &&
      buildReady
      ? "AUTHORIZED"
      : evidenceReady &&
        buildReady
        ? "EVIDENCE_READY"
        : buildReady
          ? "BUILD_READY"
          : "SOURCE_READY";

const blockers = [
  ...missing,
];

if (
  !buildManifestReady
) {
  blockers.push(
    "reports/mainnet-build-manifest.json:not-verified",
  );
}

if (!evidenceReady) {
  blockers.push(
    "config/mainnet/evidence.json:not-verified",
  );
}

if (
  !authorizationReady
) {
  blockers.push(
    "config/mainnet/release-authorization.json:not-verified",
  );
}

if (
  !consumptionReady
) {
  blockers.push(
    "config/mainnet/release-consumption.json:not-verified",
  );
}

const result = {
  ok:
    true,
  version:
    "1.0.0",
  codeReady:
    true,
  buildReady,
  buildManifestVerified:
    buildManifestReady,
  deploymentEvidenceReady:
    evidenceReady,
  releaseAuthorized:
    authorizationReady,
  authorizationConsumed:
    consumptionReady,
  releaseState,
  readyForMainnet:
    buildReady &&
    evidenceReady &&
    authorizationReady &&
    consumptionReady,
  blockers:
    [...new Set(blockers)],
};

fs.mkdirSync(
  "reports",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  "reports/mainnet-status.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);
