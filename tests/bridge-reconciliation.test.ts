import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgeReconciliationRecord,
  createBridgeReconciliationRecord,
} from "../packages/protocol/src/bridge-reconciliation.js";

const base = {
  version:
    "1.0.0" as const,
  intentId:
    "c".repeat(64),
  direction:
    "solana-to-sui" as const,
  principalBaseUnits:
    "1000000000",
  source: {
    chain:
      "solana" as const,
    transactionId:
      "solana-signature",
    finalityPosition:
      "123456",
    amountBaseUnits:
      "1000000000",
    observedAt:
      "2026-08-15T00:00:01.000Z",
  },
  destination: {
    chain:
      "sui" as const,
    transactionId:
      "sui-digest",
    finalityPosition:
      "789",
    amountBaseUnits:
      "1000000000",
    observedAt:
      "2026-08-15T00:00:02.000Z",
  },
};

test(
  "reconciliation commitments are deterministic",
  () => {
    const first =
      createBridgeReconciliationRecord(
        base,
      );
    const second =
      createBridgeReconciliationRecord(
        base,
      );

    assert.equal(
      first.sourceEvidenceSha256,
      second.sourceEvidenceSha256,
    );
    assert.equal(
      first.destinationEvidenceSha256,
      second.destinationEvidenceSha256,
    );
    assert.equal(
      first.reconciliationSha256,
      second.reconciliationSha256,
    );
    assert.equal(
      first.complete,
      true,
    );
    assert.equal(
      first.conserved,
      true,
    );
  },
);

test(
  "reconciliation rejects wrong source chain",
  () => {
    assert.throws(
      () =>
        createBridgeReconciliationRecord({
          ...base,
          source: {
            ...base.source,
            chain:
              "sui",
          },
        }),
      /PWRC_BRIDGE_RECONCILIATION_CHAIN_MISMATCH/,
    );
  },
);

test(
  "reconciliation rejects amount mismatch",
  () => {
    assert.throws(
      () =>
        createBridgeReconciliationRecord({
          ...base,
          destination: {
            ...base.destination,
            amountBaseUnits:
              "999999999",
          },
        }),
      /PWRC_BRIDGE_RECONCILIATION_CONSERVATION_MISMATCH/,
    );
  },
);

test(
  "reconciliation detects commitment tampering",
  () => {
    const record =
      createBridgeReconciliationRecord(
        base,
      );

    assert.throws(
      () =>
        assertBridgeReconciliationRecord({
          ...record,
          reconciliationSha256:
            "d".repeat(64),
        }),
      /PWRC_BRIDGE_RECONCILIATION_COMMITMENT_MISMATCH/,
    );
  },
);
