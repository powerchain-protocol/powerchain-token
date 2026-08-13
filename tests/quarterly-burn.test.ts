import test from "node:test";
import assert from "node:assert/strict";
import {
  assertQuarterlyBurnCrossChainSafe,
  quoteQuarterlyBurnFromLiveSupply,
} from "../packages/protocol/src/burn/policy.js";
import { quarterWindow } from "../packages/protocol/src/burn/schedule.js";

test("first 2 percent burn from genesis live supply is exact", () => {
  const q = quoteQuarterlyBurnFromLiveSupply(
    18_446_000_000_000_000_000n,
  );
  assert.equal(q.targetBurnBaseUnits, 368_920_000_000_000_000n);
  assert.equal(
    q.postBurnCanonicalSupplyBaseUnits,
    18_077_080_000_000_000_000n,
  );
});

test("quarter id is deterministic", () => {
  const w = quarterWindow(new Date("2026-08-12T00:00:00Z"));
  assert.equal(w.burnId, "pwrc:quarterly-burn:2026:q3");
});

test("burn blocks if wrapped exposure exceeds post-burn supply", () => {
  assert.throws(
    () =>
      assertQuarterlyBurnCrossChainSafe({
        postBurnCanonicalSupplyBaseUnits: 80n,
        solanaLockedBaseUnits: 100n,
        suiWrappedSupplyBaseUnits: 90n,
        pendingSolanaToSuiBaseUnits: 0n,
        pendingSuiToSolanaBaseUnits: 0n,
      }),
    /PWRC_BURN_WOULD_EXCEED_POST_BURN_CANONICAL_CEILING/,
  );
});
