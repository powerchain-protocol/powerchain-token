import test from "node:test";
import assert from "node:assert/strict";
import { evaluateBridgeConservation } from "../src/bridge/conservation.js";

test("Sui burn pending release remains part of locked backing exposure", () => {
  const result = evaluateBridgeConservation({
    canonicalLiveSupplyBaseUnits: 100n,
    lockedCanonicalBaseUnits: 100n,
    wrappedSupplyBaseUnits: 90n,
    pendingSolanaToSuiBaseUnits: 0n,
    pendingSuiToSolanaBaseUnits: 10n,
  });
  assert.equal(result.valid, true);
  assert.equal(result.effectiveWrappedExposureBaseUnits, 100n);
});

test("Solana lock pending Sui mint remains part of locked backing exposure", () => {
  const result = evaluateBridgeConservation({
    canonicalLiveSupplyBaseUnits: 110n,
    lockedCanonicalBaseUnits: 110n,
    wrappedSupplyBaseUnits: 100n,
    pendingSolanaToSuiBaseUnits: 10n,
    pendingSuiToSolanaBaseUnits: 0n,
  });
  assert.equal(result.valid, true);
  assert.equal(result.effectiveWrappedExposureBaseUnits, 110n);
});
