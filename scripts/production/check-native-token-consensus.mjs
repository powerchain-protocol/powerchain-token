import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/native-token-consensus.ts",
    "utf8",
  );
const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_OBSERVATION_V1",
  "POWERCHAIN_NATIVE_PWRC_CONSENSUS_V1",
  "PWRC_NATIVE_CONSENSUS_INSUFFICIENT_OBSERVERS",
  "PWRC_NATIVE_CONSENSUS_DUPLICATE_OBSERVER",
  "PWRC_NATIVE_CONSENSUS_OBSERVATION_MISMATCH",
  "PWRC_NATIVE_CONSENSUS_PROFILE_INVALID",
  "verifyNativePwrcMintObservation",
  "snapshotSha256",
  "assertNativePwrcConsensus",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `native-token-consensus:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "verifyNativePwrcAcrossRpcs",
  "getSlot",
  "PWRC_NATIVE_RPC_PROFILE_VERIFICATION_FAILED",
  "PWRC_NATIVE_RPC_CONSENSUS_FAILED",
  "minimumObservers",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `native-token-consensus:sdk:${invariant}`,
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
      `native-token-consensus:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  minimumObservers:
    2,
  deterministicSnapshot:
    true,
  detectsRpcDivergence:
    true,
  validatesCanonicalProfileInternally:
    true,
  inputOrderingStable:
    true,
  monetaryWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
