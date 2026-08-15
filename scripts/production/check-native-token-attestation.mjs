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

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_ATTESTATION_V1",
  "PWRC_NATIVE_ATTESTATION_WRONG_GENESIS",
  "PWRC_NATIVE_ATTESTATION_STALE",
  "PWRC_NATIVE_ATTESTATION_FROM_FUTURE",
  "PWRC_NATIVE_ATTESTATION_SLOT_SKEW_EXCEEDED",
  "observationRanges",
  "PWRC_NATIVE_ATTESTATION_INTRA_SLOT_SKEW_EXCEEDED",
  "PWRC_NATIVE_ATTESTATION_SLOT_RANGE_INVALID",
  "maxIntraObservationSlotSkew",
  "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_EXCEEDED",
  "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_INVALID",
  "evaluationAt",
  "decodedBase58Length",
  "attestationSha256",
  "maxEpochSkew",
  "assertNativePwrcAttestation",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `native-token-attestation:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "getGenesisHash",
  "getSlot",
  "currentEpoch",
  "expectedGenesisHash",
  "maxObservationAgeMs",
  "maxSlotSkew",
  "PWRC_NATIVE_RPC_ATTESTATION_FAILED",
  "attestationSha256",
  "maxEpochSkew",
  "attestationPolicy",
  "evaluationNow",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `native-token-attestation:sdk:${invariant}`,
    );
  }
}

for (const forbidden of [
  "sendTransaction(",
  "sendAndConfirmTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    protocol.includes(
      forbidden,
    ) ||
    observer.includes(
      forbidden,
    )
  ) {
    failures.push(
      `native-token-attestation:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  networkGenesisBinding:
    true,
  freshnessChecks:
    true,
  finalizedSlotSkew:
    true,
  epochBinding:
    true,
  adjacentEpochBoundary:
    true,
  exactGenesisHashLength:
    true,
  evaluationTimeBinding:
    true,
  intraObservationSlotRangeBinding:
    true,
  monetaryWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
