import {
  canonicalJsonSha256,
} from "./helpers.js";
import type {
  BridgeDirection,
} from "./bridge-settlement.js";

export interface BridgeFinalityEvidence {
  chain:
    "solana" |
    "sui";
  transactionId:
    string;
  finalityPosition:
    string;
  amountBaseUnits:
    string;
  observedAt:
    string;
}

export interface BridgeReconciliationInput {
  version:
    "1.0.0";
  intentId:
    string;
  direction:
    BridgeDirection;
  principalBaseUnits:
    string;
  source:
    BridgeFinalityEvidence;
  destination:
    BridgeFinalityEvidence;
}

export interface BridgeReconciliationRecord
  extends BridgeReconciliationInput {
  sourceEvidenceSha256:
    string;
  destinationEvidenceSha256:
    string;
  reconciliationSha256:
    string;
  conserved:
    true;
  complete:
    true;
}

function assertPositiveDecimal(
  value:
    string,
  code:
    string,
): void {
  if (
    !/^[1-9][0-9]*$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }
}

function assertIsoTimestamp(
  value:
    string,
  code:
    string,
): void {
  const parsed =
    Date.parse(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    new Date(
      parsed,
    ).toISOString() !==
      value
  ) {
    throw new Error(
      code,
    );
  }
}

function assertEvidence(
  evidence:
    BridgeFinalityEvidence,
  expectedChain:
    "solana" |
    "sui",
): void {
  if (
    evidence.chain !==
      expectedChain
  ) {
    throw new Error(
      "PWRC_BRIDGE_RECONCILIATION_CHAIN_MISMATCH",
    );
  }

  if (
    !evidence
      .transactionId
      .trim() ||
    !evidence
      .finalityPosition
      .trim()
  ) {
    throw new Error(
      "PWRC_BRIDGE_RECONCILIATION_EVIDENCE_REQUIRED",
    );
  }

  assertPositiveDecimal(
    evidence
      .amountBaseUnits,
    "PWRC_BRIDGE_RECONCILIATION_AMOUNT_INVALID",
  );

  assertIsoTimestamp(
    evidence.observedAt,
    "PWRC_BRIDGE_RECONCILIATION_TIMESTAMP_INVALID",
  );
}

export function createBridgeReconciliationRecord(
  input:
    BridgeReconciliationInput,
): BridgeReconciliationRecord {
  if (
    !/^[a-f0-9]{64}$/.test(
      input.intentId,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_RECONCILIATION_INTENT_INVALID",
    );
  }

  assertPositiveDecimal(
    input
      .principalBaseUnits,
    "PWRC_BRIDGE_RECONCILIATION_PRINCIPAL_INVALID",
  );

  const expected =
    input.direction ===
      "solana-to-sui"
      ? {
          source:
            "solana" as const,
          destination:
            "sui" as const,
        }
      : {
          source:
            "sui" as const,
          destination:
            "solana" as const,
        };

  assertEvidence(
    input.source,
    expected.source,
  );
  assertEvidence(
    input.destination,
    expected.destination,
  );

  if (
    input
      .source
      .amountBaseUnits !==
      input
        .principalBaseUnits ||
    input
      .destination
      .amountBaseUnits !==
      input
        .principalBaseUnits
  ) {
    throw new Error(
      "PWRC_BRIDGE_RECONCILIATION_CONSERVATION_MISMATCH",
    );
  }

  const sourceEvidenceSha256 =
    canonicalJsonSha256({
      version:
        "1.0.0",
      intentId:
        input.intentId,
      direction:
        input.direction,
      role:
        "source",
      evidence:
        input.source,
    });

  const destinationEvidenceSha256 =
    canonicalJsonSha256({
      version:
        "1.0.0",
      intentId:
        input.intentId,
      direction:
        input.direction,
      role:
        "destination",
      evidence:
        input.destination,
    });

  const reconciliationSha256 =
    canonicalJsonSha256({
      version:
        "1.0.0",
      intentId:
        input.intentId,
      direction:
        input.direction,
      principalBaseUnits:
        input
          .principalBaseUnits,
      sourceEvidenceSha256,
      destinationEvidenceSha256,
    });

  return {
    ...input,
    sourceEvidenceSha256,
    destinationEvidenceSha256,
    reconciliationSha256,
    conserved:
      true,
    complete:
      true,
  };
}

export function assertBridgeReconciliationRecord(
  record:
    BridgeReconciliationRecord,
): void {
  const expected =
    createBridgeReconciliationRecord({
      version:
        record.version,
      intentId:
        record.intentId,
      direction:
        record.direction,
      principalBaseUnits:
        record
          .principalBaseUnits,
      source:
        record.source,
      destination:
        record.destination,
    });

  if (
    record.sourceEvidenceSha256 !==
      expected.sourceEvidenceSha256 ||
    record.destinationEvidenceSha256 !==
      expected.destinationEvidenceSha256 ||
    record.reconciliationSha256 !==
      expected.reconciliationSha256 ||
    record.conserved !==
      true ||
    record.complete !==
      true
  ) {
    throw new Error(
      "PWRC_BRIDGE_RECONCILIATION_COMMITMENT_MISMATCH",
    );
  }
}
