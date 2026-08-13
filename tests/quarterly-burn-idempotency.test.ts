import test from "node:test";
import assert from "node:assert/strict";
import {
  decodeQuarterId,
  encodeQuarterId,
} from "../packages/protocol/src/burn/quarter-id.js";
import {
  assertQuarterlyBurnTransition,
} from "../packages/protocol/src/burn/state.js";
import {
  reconcileQuarterlyBurn,
} from "../packages/protocol/src/burn/reconcile.js";
import {
  assertSuiMintWithinLiveCeiling,
} from "../packages/protocol/src/sui/mint-guard.js";

test("quarter IDs are deterministic and monotonic by quarter", () => {
  assert.equal(encodeQuarterId(2026, 3), 20263n);
  assert.deepEqual(decodeQuarterId(20264n), {
    year: 2026,
    quarter: 4,
  });
});

test("burn workflow cannot skip Solana finalization", () => {
  assert.throws(
    () =>
      assertQuarterlyBurnTransition(
        "SOLANA_SIMULATED",
        "SUI_BRIDGE_PAUSED",
      ),
    /PWRC_BURN_INVALID_TRANSITION/,
  );
});

test("reconciliation requires exact Solana and Sui live supply equality", () => {
  assert.throws(
    () =>
      reconcileQuarterlyBurn({
        expectedPostBurnSupplyBaseUnits: 98n,
        observedSolanaSupplyBaseUnits: 98n,
        observedSuiCanonicalCeilingBaseUnits: 100n,
        observedSuiWrappedSupplyBaseUnits: 20n,
        observedSolanaLockedBaseUnits: 20n,
        pendingSolanaToSuiBaseUnits: 0n,
        pendingSuiToSolanaBaseUnits: 0n,
      }),
    /PWRC_BURN_SUI_CEILING_MISMATCH/,
  );
});

test("relayer fails closed when Sui canonical ceiling is stale", () => {
  assert.throws(
    () =>
      assertSuiMintWithinLiveCeiling({
        canonicalLiveSupplyBaseUnits: 98n,
        suiCanonicalSupplyCeilingBaseUnits: 100n,
        currentSuiWrappedSupplyBaseUnits: 10n,
        requestedMintBaseUnits: 1n,
      }),
    /WPWRC_CANONICAL_CEILING_STALE/,
  );
});
