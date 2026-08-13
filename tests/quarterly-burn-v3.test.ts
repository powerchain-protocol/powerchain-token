import test from "node:test";
import assert from "node:assert/strict";
import {
  quarterlyExecutionWindow,
  assertWithinQuarterlyExecutionWindow,
} from "../packages/protocol/src/burn/window.js";
import {
  assertSolanaSupplyObserverConsensus,
} from "../packages/protocol/src/burn/observers.js";
import {
  hashBurnJournalEntry,
  verifyBurnJournalChain,
} from "../packages/protocol/src/burn/journal.js";
import {
  assertExactBurnExecution,
} from "../packages/protocol/src/burn/execution.js";
import {
  evaluateQuarterlyBurnReadiness,
} from "../packages/protocol/src/burn/readiness.js";

test("Q3 execution window starts after quarter close", () => {
  const w = quarterlyExecutionWindow({
    year: 2026,
    quarter: 3,
    graceDays: 14,
  });
  assert.equal(w.startsAt, "2026-10-01T00:00:00.000Z");
  assert.equal(w.endsAt, "2026-10-15T00:00:00.000Z");
  assert.throws(
    () =>
      assertWithinQuarterlyExecutionWindow({
        now: new Date("2026-09-30T23:59:59Z"),
        year: 2026,
        quarter: 3,
      }),
    /PWRC_BURN_TOO_EARLY/,
  );
});

test("independent Solana observers must agree exactly", () => {
  const now = Date.parse("2026-10-01T00:00:30Z");
  assert.doesNotThrow(() =>
    assertSolanaSupplyObserverConsensus({
      nowMs: now,
      observations: [
        {
          observerId: "observer-a",
          rpcUrl: "https://rpc-a.example",
          slot: 100n,
          supplyBaseUnits: 98n,
          observedAt: "2026-10-01T00:00:00Z",
        },
        {
          observerId: "observer-b",
          rpcUrl: "https://rpc-b.example",
          slot: 101n,
          supplyBaseUnits: 98n,
          observedAt: "2026-10-01T00:00:01Z",
        },
      ],
    }),
  );
});

test("journal chain detects tampering", () => {
  const firstBody = {
    version: "1.0.0" as const,
    burnId: "pwrc:quarterly-burn:2026:q3",
    quarterId: "20263",
    stage: "PLANNED" as const,
    timestamp: "2026-10-01T00:00:00Z",
    detailsSha256: "a".repeat(64),
    previousEntrySha256: null,
  };
  const first = { ...firstBody, sha256: hashBurnJournalEntry(firstBody) };

  assert.doesNotThrow(() => verifyBurnJournalChain([first]));

  assert.throws(
    () => verifyBurnJournalChain([{ ...first, sha256: "b".repeat(64) }]),
    /PWRC_BURN_JOURNAL_ENTRY_HASH_MISMATCH/,
  );
});

test("partial burn execution is forbidden", () => {
  assert.throws(
    () =>
      assertExactBurnExecution({
        plannedBurnBaseUnits: 20n,
        observedBurnedBaseUnits: 19n,
        preBurnSupplyBaseUnits: 100n,
        postBurnSupplyBaseUnits: 81n,
      }),
    /PWRC_PARTIAL_OR_EXCESS_BURN_FORBIDDEN/,
  );
});

test("mainnet readiness fails closed", () => {
  const result = evaluateQuarterlyBurnReadiness({
    canonicalMint: "mint",
    burnSourceTokenAccount: "source",
    burnAuthority: "authority",
    burnAuthorityIsMultisig: false,
    controlledSourceBalanceBaseUnits: 20n,
    targetBurnBaseUnits: 20n,
    independentSolanaObservers: 2,
    solanaSupplyConsensus: true,
    suiBridgePaused: true,
    suiCanonicalCeilingBaseUnits: 100n,
    canonicalLiveSupplyBaseUnits: 100n,
    priorQuarterEvidenceVerified: true,
    currentQuarterAlreadyExecuted: false,
    currentQuarterId: 20271n,
    previousQuarterId: null,
  });
  assert.equal(result.ready, false);
  assert.match(result.blockers.join(","), /multisig/);
});
