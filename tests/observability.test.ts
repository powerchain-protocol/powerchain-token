import test from "node:test";
import assert from "node:assert/strict";
import {
  summarizeProviderHealth,
} from "../src/observability/health.js";
import {
  createEvidenceEnvelope,
  verifyEvidenceEnvelope,
} from "../src/observability/evidence.js";
import {
  retryDelayMs,
  shouldRetryHttpStatus,
} from "../src/observability/retry.js";
import {
  evaluateProductionReadiness,
  assertCoreProductionReady,
} from "../src/readiness.js";

test("provider health degrades after failures", () => {
  const observations = Array.from({ length: 10 }, (_, i) => ({
    provider: "pyth",
    ok: i < 8,
    latencyMs: 200,
    observedAt: 1000 + i,
  }));
  const health = summarizeProviderHealth("pyth", observations);
  assert.equal(health.state, "degraded");
  assert.equal(health.sampleCount, 10);
});

test("evidence envelopes detect tampering", () => {
  const evidence = createEvidenceEnvelope({
    type: "market-price",
    observedAt: 1000,
    subject: "PWRC",
    payload: { price: "1.00" },
  });
  assert.doesNotThrow(() => verifyEvidenceEnvelope(evidence));

  const tampered = {
    ...evidence,
    payload: { price: "2.00" },
  };
  assert.throws(() => verifyEvidenceEnvelope(tampered), /EVIDENCE_HASH_MISMATCH/);
});

test("read retry policy is bounded", () => {
  assert.equal(retryDelayMs(1), 250);
  assert.equal(retryDelayMs(2), 500);
  assert.equal(retryDelayMs(10), 2000);
  assert.equal(shouldRetryHttpStatus(429), true);
  assert.equal(shouldRetryHttpStatus(400), false);
});

test("production readiness blocks missing core identities", () => {
  const checks = evaluateProductionReadiness({
    canonicalMint: null,
    mainnetRpcUrl: null,
    pythFeedId: null,
    birdeyeConfigured: false,
    bridgePackageId: null,
    bridgeCoinType: null,
    cctpMessageTransmitter: null,
    cctpTokenMessengerMinter: null,
  });

  assert.throws(
    () => assertCoreProductionReady(checks),
    /PWRC_PRODUCTION_NOT_READY/,
  );
});
