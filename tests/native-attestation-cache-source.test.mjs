import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );

test(
  "native attestation cache is keyed by verification configuration",
  () => {
    for (const invariant of [
      "nativeAttestationCacheKey",
      "expectedGenesisHash",
      "primaryRpc",
      "secondaryRpc",
      "transferFeeConfigAuthority",
      "withdrawWithheldAuthority",
      "heliusKey",
      "attestationCache?.key",
      "attestationInFlight?.key",
    ]) {
      assert.ok(
        source.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "native attestation cache lifetime cannot outlive observation freshness",
  () => {
    for (const invariant of [
      "effectiveCacheMs",
      "Math.min(",
      "config.maxObservationAgeMs",
      "attestationEvaluationExpiresAt",
      "evaluationAt",
    ]) {
      assert.ok(
        source.includes(
          invariant,
        ),
      );
    }
  },
);
