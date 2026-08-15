export type BridgeRiskLevel =
  | "NORMAL"
  | "ELEVATED"
  | "PAUSE_RECOMMENDED"
  | "HALT_REQUIRED";

export interface BridgeRiskPolicy {
  version:
    "1.0.0";
  maxPendingExposureBaseUnits:
    bigint;
  maxPendingOperations:
    number;
  maxEvidenceAgeMs:
    number;
  reconciliationMismatchTrips:
    boolean;
  undercollateralizationTrips:
    boolean;
}

export interface BridgeRiskInput {
  canonicalLockedBaseUnits:
    bigint;
  wrappedSupplyBaseUnits:
    bigint;
  pendingSolanaToSuiBaseUnits:
    bigint;
  pendingSuiToSolanaBaseUnits:
    bigint;
  pendingOperations:
    number;
  oldestEvidenceAgeMs:
    number;
  reconciliationMismatch:
    boolean;
}

export interface BridgeRiskDecision {
  version:
    "1.0.0";
  level:
    BridgeRiskLevel;
  pauseRecommended:
    boolean;
  haltRequired:
    boolean;
  allowNewBridgeIntents:
    boolean;
  reasons:
    readonly string[];
  pendingExposureBaseUnits:
    bigint;
  effectiveWrappedExposureBaseUnits:
    bigint;
}

function assertNonNegativeBigInt(
  value:
    bigint,
  code:
    string,
): void {
  if (value < 0n) {
    throw new Error(
      code,
    );
  }
}

function assertNonNegativeInteger(
  value:
    number,
  code:
    string,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value < 0
  ) {
    throw new Error(
      code,
    );
  }
}

export function evaluateBridgeRisk(
  policy:
    BridgeRiskPolicy,
  input:
    BridgeRiskInput,
): BridgeRiskDecision {
  for (const amount of [
    policy.maxPendingExposureBaseUnits,
    input.canonicalLockedBaseUnits,
    input.wrappedSupplyBaseUnits,
    input.pendingSolanaToSuiBaseUnits,
    input.pendingSuiToSolanaBaseUnits,
  ]) {
    assertNonNegativeBigInt(
      amount,
      "PWRC_BRIDGE_RISK_AMOUNT_INVALID",
    );
  }

  assertNonNegativeInteger(
    policy.maxPendingOperations,
    "PWRC_BRIDGE_RISK_POLICY_PENDING_OPS_INVALID",
  );
  assertNonNegativeInteger(
    policy.maxEvidenceAgeMs,
    "PWRC_BRIDGE_RISK_POLICY_EVIDENCE_AGE_INVALID",
  );
  assertNonNegativeInteger(
    input.pendingOperations,
    "PWRC_BRIDGE_RISK_PENDING_OPS_INVALID",
  );
  assertNonNegativeInteger(
    input.oldestEvidenceAgeMs,
    "PWRC_BRIDGE_RISK_EVIDENCE_AGE_INVALID",
  );

  if (
    input.pendingSuiToSolanaBaseUnits >
      input.wrappedSupplyBaseUnits
  ) {
    throw new Error(
      "PWRC_BRIDGE_RISK_PENDING_BURN_EXCEEDS_WRAPPED_SUPPLY",
    );
  }

  const pendingExposureBaseUnits =
    input.pendingSolanaToSuiBaseUnits +
    input.pendingSuiToSolanaBaseUnits;

  const effectiveWrappedExposureBaseUnits =
    input.wrappedSupplyBaseUnits -
    input.pendingSuiToSolanaBaseUnits +
    input.pendingSolanaToSuiBaseUnits;

  const reasons:
    string[] =
    [];

  let haltRequired =
    false;
  let pauseRecommended =
    false;

  if (
    policy.undercollateralizationTrips &&
    effectiveWrappedExposureBaseUnits >
      input.canonicalLockedBaseUnits
  ) {
    haltRequired =
      true;
    reasons.push(
      "PWRC_BRIDGE_RISK_UNDERCOLLATERALIZED",
    );
  }

  if (
    policy.reconciliationMismatchTrips &&
    input.reconciliationMismatch
  ) {
    haltRequired =
      true;
    reasons.push(
      "PWRC_BRIDGE_RISK_RECONCILIATION_MISMATCH",
    );
  }

  if (
    pendingExposureBaseUnits >
      policy.maxPendingExposureBaseUnits
  ) {
    pauseRecommended =
      true;
    reasons.push(
      "PWRC_BRIDGE_RISK_PENDING_EXPOSURE_LIMIT",
    );
  }

  if (
    input.pendingOperations >
      policy.maxPendingOperations
  ) {
    pauseRecommended =
      true;
    reasons.push(
      "PWRC_BRIDGE_RISK_PENDING_OPERATION_LIMIT",
    );
  }

  if (
    input.oldestEvidenceAgeMs >
      policy.maxEvidenceAgeMs
  ) {
    pauseRecommended =
      true;
    reasons.push(
      "PWRC_BRIDGE_RISK_STALE_EVIDENCE",
    );
  }

  if (haltRequired) {
    pauseRecommended =
      true;
  }

  const level:
    BridgeRiskLevel =
    haltRequired
      ? "HALT_REQUIRED"
      : pauseRecommended
        ? "PAUSE_RECOMMENDED"
        : pendingExposureBaseUnits >
            policy.maxPendingExposureBaseUnits /
              2n ||
          input.pendingOperations >
            Math.floor(
              policy.maxPendingOperations /
                2,
            )
          ? "ELEVATED"
          : "NORMAL";

  return {
    version:
      "1.0.0",
    level,
    pauseRecommended,
    haltRequired,
    allowNewBridgeIntents:
      !pauseRecommended &&
      !haltRequired,
    reasons,
    pendingExposureBaseUnits,
    effectiveWrappedExposureBaseUnits,
  };
}
