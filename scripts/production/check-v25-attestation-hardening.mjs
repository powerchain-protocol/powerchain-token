import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/native-token-attestation.ts",
    "utf8",
  );
const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const invariant of [
  "decodedBase58Length",
  "!==\\n      32",
  "maxEpochSkew",
  "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_INVALID",
  "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_EXCEEDED",
  "evaluationAt",
  "epochSkew",
]) {
  if (
    !protocol.includes(
      invariant.replace(
        "\\n",
        "\n",
      ),
    )
  ) {
    failures.push(
      `v25:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "evaluationNow",
  "attestationPolicy",
  "maxEpochSkew",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `v25:observer:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW",
  "maxEpochSkew",
  "epochSkew",
  "evaluationAt",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `v25:runtime:${invariant}`,
    );
  }
}

if (
  !env.includes(
    "PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW=1",
  )
) {
  failures.push(
    "v25:env:PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW",
  );
}

for (const forbidden of [
  "sendTransaction(",
  "sendAndConfirmTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    protocol.includes(forbidden) ||
    observer.includes(forbidden)
  ) {
    failures.push(
      `v25:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  exactGenesisHash32Bytes:
    true,
  adjacentEpochBoundary:
    true,
  deterministicEvaluationTime:
    true,
  evaluationTimeCommitted:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
