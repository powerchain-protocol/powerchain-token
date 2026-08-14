import fs from "node:fs";

const failures = [];

const status =
  fs.readFileSync(
    "scripts/mainnet/status.mjs",
    "utf8",
  );
const consume =
  fs.readFileSync(
    "scripts/mainnet/consume-release-authorization.mjs",
    "utf8",
  );
const verifyConsumption =
  fs.readFileSync(
    "scripts/mainnet/verify-release-consumption.mjs",
    "utf8",
  );
const buildVerify =
  fs.readFileSync(
    "scripts/mainnet/verify-build-manifest.mjs",
    "utf8",
  );

for (const state of [
  '"SOURCE_READY"',
  '"BUILD_READY"',
  '"EVIDENCE_READY"',
  '"AUTHORIZED"',
  '"CONSUMED"',
]) {
  if (!status.includes(state)) {
    failures.push(
      `mainnet-state:${state}`,
    );
  }
}

for (const invariant of [
  "buildManifestVerified",
  "authorizationConsumed",
  "verify-build-manifest.mjs",
  "verify-release-consumption.mjs",
]) {
  if (!status.includes(invariant)) {
    failures.push(
      `mainnet-status:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_RELEASE_CONSUMPTION_CONFIRMATION",
  "PWRC_RELEASE_CONSUMED_BY",
  "verify-build-manifest.mjs",
  "verify-evidence.mjs",
  "verify-release-authorization.mjs",
  'flag:',
  '"wx"',
]) {
  if (!consume.includes(invariant)) {
    failures.push(
      `consume:${invariant}`,
    );
  }
}

for (const invariant of [
  "authorizationSha256",
  "evidenceSha256",
  "buildManifestSha256",
  "mismatch",
]) {
  if (!verifyConsumption.includes(invariant)) {
    failures.push(
      `consumption:${invariant}`,
    );
  }
}

for (const invariant of [
  "hash-mismatch",
  "size-mismatch",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "contracts/wpwrc/Move.lock",
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
]) {
  if (!buildVerify.includes(invariant)) {
    failures.push(
      `build-manifest:${invariant}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      stateMachine:
        [
          "SOURCE_READY",
          "BUILD_READY",
          "EVIDENCE_READY",
          "AUTHORIZED",
          "CONSUMED",
        ],
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
