import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateBridgeRisk,
} from "../packages/protocol/src/bridge-risk.js";

const policy = {
  version:
    "1.0.0" as const,
  maxPendingExposureBaseUnits:
    1_000n,
  maxPendingOperations:
    10,
  maxEvidenceAgeMs:
    60_000,
  reconciliationMismatchTrips:
    true,
  undercollateralizationTrips:
    true,
};

test(
  "normal bridge risk allows new intents",
  () => {
    const result =
      evaluateBridgeRisk(
        policy,
        {
          canonicalLockedBaseUnits:
            10_000n,
          wrappedSupplyBaseUnits:
            5_000n,
          pendingSolanaToSuiBaseUnits:
            100n,
          pendingSuiToSolanaBaseUnits:
            50n,
          pendingOperations:
            2,
          oldestEvidenceAgeMs:
            10_000,
          reconciliationMismatch:
            false,
        },
      );

    assert.equal(
      result.level,
      "NORMAL",
    );
    assert.equal(
      result.allowNewBridgeIntents,
      true,
    );
  },
);

test(
  "pending exposure limit recommends pause",
  () => {
    const result =
      evaluateBridgeRisk(
        policy,
        {
          canonicalLockedBaseUnits:
            20_000n,
          wrappedSupplyBaseUnits:
            5_000n,
          pendingSolanaToSuiBaseUnits:
            800n,
          pendingSuiToSolanaBaseUnits:
            300n,
          pendingOperations:
            2,
          oldestEvidenceAgeMs:
            10_000,
          reconciliationMismatch:
            false,
        },
      );

    assert.equal(
      result.level,
      "PAUSE_RECOMMENDED",
    );
    assert.equal(
      result.pauseRecommended,
      true,
    );
    assert.equal(
      result.allowNewBridgeIntents,
      false,
    );
  },
);

test(
  "undercollateralization requires halt",
  () => {
    const result =
      evaluateBridgeRisk(
        policy,
        {
          canonicalLockedBaseUnits:
            100n,
          wrappedSupplyBaseUnits:
            150n,
          pendingSolanaToSuiBaseUnits:
            0n,
          pendingSuiToSolanaBaseUnits:
            0n,
          pendingOperations:
            0,
          oldestEvidenceAgeMs:
            0,
          reconciliationMismatch:
            false,
        },
      );

    assert.equal(
      result.level,
      "HALT_REQUIRED",
    );
    assert.equal(
      result.haltRequired,
      true,
    );
    assert.ok(
      result.reasons.includes(
        "PWRC_BRIDGE_RISK_UNDERCOLLATERALIZED",
      ),
    );
  },
);

test(
  "reconciliation mismatch requires halt",
  () => {
    const result =
      evaluateBridgeRisk(
        policy,
        {
          canonicalLockedBaseUnits:
            10_000n,
          wrappedSupplyBaseUnits:
            5_000n,
          pendingSolanaToSuiBaseUnits:
            0n,
          pendingSuiToSolanaBaseUnits:
            0n,
          pendingOperations:
            0,
          oldestEvidenceAgeMs:
            0,
          reconciliationMismatch:
            true,
        },
      );

    assert.equal(
      result.level,
      "HALT_REQUIRED",
    );
    assert.ok(
      result.reasons.includes(
        "PWRC_BRIDGE_RISK_RECONCILIATION_MISMATCH",
      ),
    );
  },
);
