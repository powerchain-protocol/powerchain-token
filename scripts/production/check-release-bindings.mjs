import fs from "node:fs";

const failures = [];

const evidence =
  fs.readFileSync(
    "scripts/mainnet/verify-evidence.mjs",
    "utf8",
  );
const authorization =
  fs.readFileSync(
    "scripts/mainnet/verify-release-authorization.mjs",
    "utf8",
  );
const devnet =
  fs.readFileSync(
    "scripts/devnet/verify-evidence.mjs",
    "utf8",
  );
const suiRecord =
  fs.readFileSync(
    "scripts/sui/record-publish.mjs",
    "utf8",
  );
const consumption =
  fs.readFileSync(
    "scripts/mainnet/verify-release-consumption.mjs",
    "utf8",
  );
const buildManifest =
  fs.readFileSync(
    "scripts/mainnet/verify-build-manifest.mjs",
    "utf8",
  );

for (const invariant of [
  "pnpm-lock.yaml",
  "Cargo.lock",
  "contracts/wpwrc/Move.lock",
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
  "reports/mainnet-build-manifest.json",
  "hash-mismatch",
]) {
  if (
    !evidence.includes(
      invariant,
    )
  ) {
    failures.push(
      `mainnet-evidence:${invariant}`,
    );
  }
}

for (const invariant of [
  "authorization:evidenceSha256:mismatch",
  "authorization:buildManifestSha256:mismatch",
  "authorization:evidence-file-required",
  "authorization:build-manifest-required",
]) {
  if (
    !authorization.includes(
      invariant,
    )
  ) {
    failures.push(
      `authorization:${invariant}`,
    );
  }
}

for (const invariant of [
  "pwrcToken",
  "pwrcLock",
  "binarySha256",
  "deployLogSha256",
  "showLogSha256",
]) {
  if (
    !devnet.includes(
      invariant,
    )
  ) {
    failures.push(
      `devnet:${invariant}`,
    );
  }
}

for (const invariant of [
  "::wpwrc::BridgeController",
  "::wpwrc::WPWRC",
  "packageId",
  "transactionDigest",
]) {
  if (
    !suiRecord.includes(
      invariant,
    )
  ) {
    failures.push(
      `sui-record:${invariant}`,
    );
  }
}


for (const invariant of [
  "authorizationSha256",
  "evidenceSha256",
  "buildManifestSha256",
  "mismatch",
]) {
  if (!consumption.includes(invariant)) {
    failures.push(
      `release-consumption:${invariant}`,
    );
  }
}

for (const invariant of [
  "hash-mismatch",
  "size-mismatch",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "contracts/wpwrc/Move.lock",
]) {
  if (!buildManifest.includes(invariant)) {
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
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
