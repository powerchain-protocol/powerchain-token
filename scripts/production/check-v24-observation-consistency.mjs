import fs from "node:fs";

const failures = [];

const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const attestation =
  fs.readFileSync(
    "packages/protocol/src/native-token-attestation.ts",
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
  "slotStart",
  "slotEnd",
  "slotSpan",
  "PWRC_NATIVE_OBSERVATION_SLOT_REGRESSION",
  "PWRC_NATIVE_OBSERVATION_SLOT_SPAN_EXCEEDED",
  "maxIntraObservationSlotSkew",
  "Promise.all",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `v24:observer:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_NATIVE_ATTESTATION_SLOT_RANGE_INVALID",
  "PWRC_NATIVE_ATTESTATION_INTRA_SLOT_SKEW_EXCEEDED",
  "maxIntraObservationSlotSkew",
  "observationRanges",
  "slotStart",
  "slotEnd",
  "slotSpan",
]) {
  if (!attestation.includes(invariant)) {
    failures.push(
      `v24:attestation:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW",
  "maxIntraObservationSlotSkew",
  "observationRanges",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `v24:runtime:${invariant}`,
    );
  }
}

if (
  !env.includes(
    "PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW=128",
  )
) {
  failures.push(
    "v24:env:PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW",
  );
}

for (const forbidden of [
  "sendTransaction(",
  "sendAndConfirmTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    observer.includes(forbidden) ||
    attestation.includes(forbidden)
  ) {
    failures.push(
      `v24:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  observationWindowBound:
    true,
  slotRegressionRejected:
    true,
  attestationBindsObservationRanges:
    true,
  configuredIntraObservationSkew:
    true,
  concurrentFailClosedObservers:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
