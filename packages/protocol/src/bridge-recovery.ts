import type {
  BridgeDirection,
  BridgeSettlementPhase,
} from "./bridge-settlement.js";

export type BridgeFailureCode =
  | "SOURCE_REJECTED"
  | "SOURCE_FINALITY_TIMEOUT"
  | "DESTINATION_REJECTED"
  | "DESTINATION_FINALITY_TIMEOUT"
  | "EVIDENCE_STALE"
  | "RECONCILIATION_MISMATCH"
  | "PROVIDER_UNAVAILABLE"
  | "UNKNOWN";

export type BridgeRecoveryAction =
  | "ABORT"
  | "WAIT_SOURCE_FINALITY"
  | "WAIT_DESTINATION_FINALITY"
  | "REFRESH_EVIDENCE"
  | "RECONCILE"
  | "MANUAL_REVIEW";

export interface BridgeRecoveryInput {
  direction:
    BridgeDirection;
  phase:
    BridgeSettlementPhase;
  failure:
    BridgeFailureCode;
  sourceSubmitted:
    boolean;
  sourceFinalized:
    boolean;
  destinationSubmitted:
    boolean;
  destinationFinalized:
    boolean;
}

export interface BridgeRecoveryDecision {
  version:
    "1.0.0";
  action:
    BridgeRecoveryAction;
  automaticWriteRetryAllowed:
    false;
  readRetryAllowed:
    boolean;
  terminal:
    boolean;
  reason:
    string;
}

export function bridgeRecoveryDecision(
  input:
    BridgeRecoveryInput,
): BridgeRecoveryDecision {
  if (
    input.phase ===
      "COMPLETED"
  ) {
    return {
      version:
        "1.0.0",
      action:
        "ABORT",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        false,
      terminal:
        true,
      reason:
        "PWRC_BRIDGE_ALREADY_COMPLETED",
    };
  }

  if (
    input.failure ===
      "SOURCE_REJECTED" &&
    input.sourceSubmitted &&
    !input.sourceFinalized
  ) {
    return {
      version:
        "1.0.0",
      action:
        "MANUAL_REVIEW",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        false,
      reason:
        "PWRC_BRIDGE_SOURCE_WRITE_OUTCOME_UNCERTAIN",
    };
  }

  if (
    input.failure ===
      "SOURCE_FINALITY_TIMEOUT" &&
    input.sourceSubmitted &&
    !input.sourceFinalized
  ) {
    return {
      version:
        "1.0.0",
      action:
        "WAIT_SOURCE_FINALITY",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        false,
      reason:
        "PWRC_BRIDGE_SOURCE_FINALITY_PENDING",
    };
  }

  if (
    input.failure ===
      "DESTINATION_REJECTED" &&
    input.destinationSubmitted &&
    !input.destinationFinalized
  ) {
    return {
      version:
        "1.0.0",
      action:
        "MANUAL_REVIEW",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        false,
      reason:
        "PWRC_BRIDGE_DESTINATION_WRITE_OUTCOME_UNCERTAIN",
    };
  }

  if (
    input.failure ===
      "DESTINATION_FINALITY_TIMEOUT" &&
    input.destinationSubmitted &&
    !input.destinationFinalized
  ) {
    return {
      version:
        "1.0.0",
      action:
        "WAIT_DESTINATION_FINALITY",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        false,
      reason:
        "PWRC_BRIDGE_DESTINATION_FINALITY_PENDING",
    };
  }

  if (
    input.failure ===
      "EVIDENCE_STALE"
  ) {
    return {
      version:
        "1.0.0",
      action:
        "REFRESH_EVIDENCE",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        false,
      reason:
        "PWRC_BRIDGE_EVIDENCE_REFRESH_REQUIRED",
    };
  }

  if (
    input.failure ===
      "RECONCILIATION_MISMATCH"
  ) {
    return {
      version:
        "1.0.0",
      action:
        "MANUAL_REVIEW",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        true,
      reason:
        "PWRC_BRIDGE_RECONCILIATION_MISMATCH",
    };
  }

  if (
    input.failure ===
      "PROVIDER_UNAVAILABLE"
  ) {
    return {
      version:
        "1.0.0",
      action:
        input.sourceFinalized
          ? input.destinationFinalized
            ? "RECONCILE"
            : "WAIT_DESTINATION_FINALITY"
          : "WAIT_SOURCE_FINALITY",
      automaticWriteRetryAllowed:
        false,
      readRetryAllowed:
        true,
      terminal:
        false,
      reason:
        "PWRC_BRIDGE_PROVIDER_UNAVAILABLE",
    };
  }

  return {
    version:
      "1.0.0",
    action:
      "MANUAL_REVIEW",
    automaticWriteRetryAllowed:
      false,
    readRetryAllowed:
      true,
    terminal:
      true,
    reason:
      "PWRC_BRIDGE_RECOVERY_UNKNOWN",
  };
}

export interface BridgeEvidenceFreshnessInput {
  observedAt:
    string;
  now:
    string;
  maxAgeMs:
    number;
}

export function assertBridgeEvidenceFresh(
  input:
    BridgeEvidenceFreshnessInput,
): void {
  if (
    !Number.isSafeInteger(
      input.maxAgeMs,
    ) ||
    input.maxAgeMs <= 0
  ) {
    throw new Error(
      "PWRC_BRIDGE_EVIDENCE_MAX_AGE_INVALID",
    );
  }

  const observed =
    Date.parse(
      input.observedAt,
    );
  const now =
    Date.parse(
      input.now,
    );

  if (
    !Number.isFinite(
      observed,
    ) ||
    !Number.isFinite(
      now,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_EVIDENCE_TIMESTAMP_INVALID",
    );
  }

  if (
    now < observed
  ) {
    throw new Error(
      "PWRC_BRIDGE_EVIDENCE_FROM_FUTURE",
    );
  }

  if (
    now - observed >
      input.maxAgeMs
  ) {
    throw new Error(
      "PWRC_BRIDGE_EVIDENCE_STALE",
    );
  }
}
