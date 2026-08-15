import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgeEvidenceFresh,
  bridgeRecoveryDecision,
} from "../packages/protocol/src/bridge-recovery.js";

test(
  "source finality timeout never retries monetary write blindly",
  () => {
    const decision =
      bridgeRecoveryDecision({
        direction:
          "solana-to-sui",
        phase:
          "CREATED",
        failure:
          "SOURCE_FINALITY_TIMEOUT",
        sourceSubmitted:
          true,
        sourceFinalized:
          false,
        destinationSubmitted:
          false,
        destinationFinalized:
          false,
      });

    assert.equal(
      decision.action,
      "WAIT_SOURCE_FINALITY",
    );
    assert.equal(
      decision.automaticWriteRetryAllowed,
      false,
    );
    assert.equal(
      decision.readRetryAllowed,
      true,
    );
  },
);

test(
  "destination rejection with uncertain write outcome requires manual review",
  () => {
    const decision =
      bridgeRecoveryDecision({
        direction:
          "solana-to-sui",
        phase:
          "DESTINATION_SUBMITTED",
        failure:
          "DESTINATION_REJECTED",
        sourceSubmitted:
          true,
        sourceFinalized:
          true,
        destinationSubmitted:
          true,
        destinationFinalized:
          false,
      });

    assert.equal(
      decision.action,
      "MANUAL_REVIEW",
    );
    assert.equal(
      decision.automaticWriteRetryAllowed,
      false,
    );
  },
);

test(
  "reconciliation mismatch is terminal",
  () => {
    const decision =
      bridgeRecoveryDecision({
        direction:
          "sui-to-solana",
        phase:
          "DESTINATION_FINALIZED",
        failure:
          "RECONCILIATION_MISMATCH",
        sourceSubmitted:
          true,
        sourceFinalized:
          true,
        destinationSubmitted:
          true,
        destinationFinalized:
          true,
      });

    assert.equal(
      decision.terminal,
      true,
    );
    assert.equal(
      decision.action,
      "MANUAL_REVIEW",
    );
  },
);

test(
  "evidence freshness rejects stale and future observations",
  () => {
    assertBridgeEvidenceFresh({
      observedAt:
        "2026-08-15T00:00:00.000Z",
      now:
        "2026-08-15T00:00:30.000Z",
      maxAgeMs:
        60_000,
    });

    assert.throws(
      () =>
        assertBridgeEvidenceFresh({
          observedAt:
            "2026-08-15T00:00:00.000Z",
          now:
            "2026-08-15T00:02:00.000Z",
          maxAgeMs:
            60_000,
        }),
      /PWRC_BRIDGE_EVIDENCE_STALE/,
    );

    assert.throws(
      () =>
        assertBridgeEvidenceFresh({
          observedAt:
            "2026-08-15T00:01:00.000Z",
          now:
            "2026-08-15T00:00:00.000Z",
          maxAgeMs:
            60_000,
        }),
      /PWRC_BRIDGE_EVIDENCE_FROM_FUTURE/,
    );
  },
);
