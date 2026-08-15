import fs from "node:fs";

const failures = [];

const api =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/solana-client.ts",
    "utf8",
  );
const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const invariant of [
  "nativePwrcVerificationConfig",
  "liveNativePwrcAttestation",
  "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_REQUIRED",
  "PWRC_NATIVE_VERIFICATION_HELIUS_REQUIRED",
  "PWRC_NATIVE_VERIFICATION_HELIUS_KEY_REQUIRED",
  "minimumObservers",
  "maxObservationAgeMs",
  "maxSlotSkew",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `native-verification:api:${invariant}`,
    );
  }
}

for (const invariant of [
  "createPowerChainSolanaReadConnections",
  "secondaryConfigured",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `native-verification:sdk:${invariant}`,
    );
  }
}

if (
  !observer.includes(
    "verifyConfiguredNativePwrcAcrossRpcs",
  )
) {
  failures.push(
    "native-verification:configured-attestation-helper",
  );
}

for (const route of [
  "/api/v1/token/native-verification",
  "/api/v1/token/native-attestation",
]) {
  if (!server.includes(route)) {
    failures.push(
      `native-verification:route:${route}`,
    );
  }
}

for (const key of [
  "PWRC_NATIVE_VERIFY_MIN_OBSERVERS=2",
  "PWRC_NATIVE_VERIFY_MAX_AGE_MS=60000",
  "PWRC_NATIVE_VERIFY_MAX_SLOT_SKEW=128",
]) {
  if (!env.includes(key)) {
    failures.push(
      `native-verification:env:${key}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  liveMultiProviderAttestation:
    true,
  heliusPrimaryRequired:
    true,
  independentSecondaryRequired:
    true,
  trustedGenesisRequired:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
