import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgeIdentity,
  verifyBridgeConservation,
} from "../src/bridge.js";

test("bridge identity requires Solana PWRC and Sui wPWRC with 9 decimals", () => {
  assert.doesNotThrow(() =>
    assertBridgeIdentity({
      canonical: { chain: "solana", mint: null, decimals: 9 },
      wrapped: { chain: "sui", coinType: null, packageId: null, decimals: 9 },
    }),
  );
});

test("1:1 wrapped supply is fully backed", () => {
  const report = verifyBridgeConservation({
    lockedCanonicalBaseUnits: 1_000_000_000n,
    wrappedSupplyBaseUnits: 1_000_000_000n,
  });

  assert.equal(report.valid, true);
  assert.equal(report.surplusBackingBaseUnits, 0n);
});

test("under-backed wPWRC is rejected", () => {
  const report = verifyBridgeConservation({
    lockedCanonicalBaseUnits: 1_000_000_000n,
    wrappedSupplyBaseUnits: 1_000_000_001n,
  });

  assert.equal(report.valid, false);
  assert.ok(report.errors.includes("WRAPPED_SUPPLY_EXCEEDS_LOCKED_CANONICAL"));
});

test("pending canonical to wrapped is included in backing requirement", () => {
  const report = verifyBridgeConservation({
    lockedCanonicalBaseUnits: 2_000_000_000n,
    wrappedSupplyBaseUnits: 1_500_000_000n,
    pendingCanonicalToWrappedBaseUnits: 500_000_000n,
  });

  assert.equal(report.valid, true);
});

test("wrapped supply can never exceed canonical max", () => {
  const report = verifyBridgeConservation({
    lockedCanonicalBaseUnits: 18_446_000_000_000_000_000n,
    wrappedSupplyBaseUnits: 18_446_000_000_000_000_001n,
  });

  assert.equal(report.valid, false);
  assert.ok(report.errors.includes("WRAPPED_SUPPLY_EXCEEDS_PWRC_MAX"));
});

test("pending Sui to Solana remains backing exposure until release finalizes", () => {
  const report = verifyBridgeConservation({
    lockedCanonicalBaseUnits: 2_000_000_000n,
    wrappedSupplyBaseUnits: 1_500_000_000n,
    pendingWrappedToCanonicalBaseUnits: 500_000_000n,
  });

  assert.equal(report.valid, true);
  assert.equal(report.wrappedExposureCanonicalBaseUnits, 2_000_000_000n);
  assert.equal(report.surplusBackingBaseUnits, 0n);
});
