import type {
  BridgeSettlementPhase,
} from "./bridge-settlement.js";
import type {
  BridgeRiskDecision,
} from "./bridge-risk.js";

export interface BridgeSafetyInput {
  phase:
    BridgeSettlementPhase;
  risk:
    BridgeRiskDecision;
  sourceFinalized:
    boolean;
  destinationFinalized:
    boolean;
  reconciliationVerified:
    boolean;
  auditChainValid:
    boolean;
  recoveryRequired:
    boolean;
  governancePauseActive:
    boolean;
}

export interface BridgeSafetySnapshot {
  version:
    "1.0.0";
  acceptNewIntents:
    boolean;
  allowDestinationSubmission:
    boolean;
  allowCompletion:
    boolean;
  operatorAttentionRequired:
    boolean;
  reasons:
    readonly string[];
}


export function evaluateBridgeSafety(
  input:
    BridgeSafetyInput,
): BridgeSafetySnapshot {
  const reasons:
    string[] =
    [];

  const phaseRequiresSourceFinality =
    input.phase !==
      "CREATED" &&
    input.phase !==
      "FAILED";

  const phaseRequiresDestinationFinality =
    input.phase ===
      "DESTINATION_FINALIZED" ||
    input.phase ===
      "COMPLETED";

  const phaseRequiresReconciliation =
    input.phase ===
      "COMPLETED";

  if (
    input.phase ===
      "CREATED" &&
    (
      input.sourceFinalized ||
      input.destinationFinalized ||
      input.reconciliationVerified
    )
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
    );
  }

  if (
    input.destinationFinalized &&
    !input.sourceFinalized
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
    );
  }

  if (
    input.reconciliationVerified &&
    !input.destinationFinalized
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
    );
  }

  if (
    input.governancePauseActive
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_GOVERNANCE_PAUSED",
    );
  }

  if (
    input.risk.haltRequired
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_RISK_HALT_REQUIRED",
    );
  } else if (
    input.risk.pauseRecommended
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_RISK_PAUSE_RECOMMENDED",
    );
  }

  if (
    !input.auditChainValid
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_AUDIT_INVALID",
    );
  }

  if (
    input.recoveryRequired
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_RECOVERY_REQUIRED",
    );
  }

  if (
    phaseRequiresSourceFinality &&
    !input.sourceFinalized
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_SOURCE_NOT_FINALIZED",
    );
  }

  if (
    phaseRequiresDestinationFinality &&
    !input.destinationFinalized
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_DESTINATION_NOT_FINALIZED",
    );
  }

  if (
    phaseRequiresReconciliation &&
    !input.reconciliationVerified
  ) {
    reasons.push(
      "PWRC_BRIDGE_SAFETY_RECONCILIATION_UNVERIFIED",
    );
  }

  const uniqueReasons =
    [...new Set(
      reasons,
    )];

  const inconsistent =
    uniqueReasons.includes(
      "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
    );

  const acceptNewIntents =
    !input.governancePauseActive &&
    !input.risk.pauseRecommended &&
    !input.risk.haltRequired &&
    input.auditChainValid &&
    !input.recoveryRequired &&
    !inconsistent;

  const allowDestinationSubmission =
    input.phase ===
      "SOURCE_FINALIZED" &&
    input.sourceFinalized &&
    !input.governancePauseActive &&
    !input.risk.haltRequired &&
    input.auditChainValid &&
    !input.recoveryRequired &&
    !inconsistent;

  const allowCompletion =
    input.phase ===
      "DESTINATION_FINALIZED" &&
    input.sourceFinalized &&
    input.destinationFinalized &&
    input.reconciliationVerified &&
    input.auditChainValid &&
    !input.recoveryRequired &&
    !input.risk.haltRequired &&
    !inconsistent;

  const attentionReasons =
    uniqueReasons.filter(
      (reason) =>
        reason !==
          "PWRC_BRIDGE_SAFETY_RISK_PAUSE_RECOMMENDED" ||
        input.phase ===
          "CREATED",
    );

  return {
    version:
      "1.0.0",
    acceptNewIntents,
    allowDestinationSubmission,
    allowCompletion,
    operatorAttentionRequired:
      attentionReasons.length >
      0,
    reasons:
      uniqueReasons,
  };
}
