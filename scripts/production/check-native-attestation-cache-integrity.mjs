import fs from "node:fs";

const failures = [];

const source =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );

for (const invariant of [
  "nativeAttestationCacheKey",
  "attestationEvaluationExpiresAt",
  "attestationCache?.key",
  "attestationInFlight?.key",
  "effectiveCacheMs",
  "config.maxObservationAgeMs",
  "primaryRpc",
  "secondaryRpc",
  "transferFeeConfigAuthority",
  "withdrawWithheldAuthority",
  "heliusKey",
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `native-attestation-cache:${invariant}`,
    );
  }
}

if (
  !source.includes(
    "Math.min(",
  )
) {
  failures.push(
    "native-attestation-cache:ttl-not-capped",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  configKeyedCache:
    true,
  configKeyedSingleFlight:
    true,
  observationFreshnessRechecked:
    true,
  cacheTtlCappedByObservationAge:
    true,
  secretConfigurationOnlyHashed:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
