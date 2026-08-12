import test from "node:test";
import assert from "node:assert/strict";
import {
  assertQuarterlyBurnTransition,
} from "../src/burn/state.js";
import {
  assertQuarterlyBurnIntent,
  quarterlyBurnIntentSha256,
} from "../src/burn/intent.js";

test("Solana burn cannot be submitted before finalized Sui intent", () => {
  assert.throws(
    () =>
      assertQuarterlyBurnTransition(
        "SUI_BRIDGE_PAUSED",
        "SOLANA_SUBMITTED",
      ),
    /PWRC_BURN_INVALID_TRANSITION/,
  );
});

test("burn intent binds expected post-burn wrapped ceiling", () => {
  const intent = {
    version: "1.0.0" as const,
    quarterId: "20271",
    burnId: "pwrc:quarterly-burn:2027:q1",
    canonicalMint: "mint",
    preBurnCanonicalSupplyBaseUnits:
      "1000000000000",
    targetBurnCanonicalBaseUnits:
      "20000000000",
    expectedPostBurnCanonicalSupplyBaseUnits:
      "980000000000",
    expectedPostBurnWrappedCeilingBaseUnits:
      "980000000",
    solanaSlot: "1",
    suiCheckpoint: "1",
    planSha256: "ab".repeat(32),
    createdAt: "2027-04-01T00:00:00Z",
  };

  assert.doesNotThrow(() =>
    assertQuarterlyBurnIntent(intent),
  );
  assert.match(
    quarterlyBurnIntentSha256(intent),
    /^[a-f0-9]{64}$/,
  );
});

test("mismatched wrapped ceiling is rejected", () => {
  assert.throws(
    () =>
      assertQuarterlyBurnIntent({
        version: "1.0.0",
        quarterId: "20271",
        burnId: "pwrc:quarterly-burn:2027:q1",
        canonicalMint: "mint",
        preBurnCanonicalSupplyBaseUnits:
          "1000000000000",
        targetBurnCanonicalBaseUnits:
          "20000000000",
        expectedPostBurnCanonicalSupplyBaseUnits:
          "980000000000",
        expectedPostBurnWrappedCeilingBaseUnits:
          "980000001",
        solanaSlot: "1",
        suiCheckpoint: "1",
        planSha256: "ab".repeat(32),
        createdAt: "2027-04-01T00:00:00Z",
      }),
    /WRAPPED_CEILING_MISMATCH/,
  );
});
