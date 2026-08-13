export interface BridgeConservationInput {
  canonicalLiveSupplyBaseUnits: bigint;
  lockedCanonicalBaseUnits: bigint;
  wrappedSupplyBaseUnits: bigint;
  pendingSolanaToSuiBaseUnits?: bigint;
  pendingSuiToSolanaBaseUnits?: bigint;
}

export function evaluateBridgeConservation(
  input: BridgeConservationInput,
) {
  const pendingToSui =
    input.pendingSolanaToSuiBaseUnits ?? 0n;
  const pendingToSolana =
    input.pendingSuiToSolanaBaseUnits ?? 0n;
  const errors: string[] = [];

  const exposure =
    input.wrappedSupplyBaseUnits +
    pendingToSui +
    pendingToSolana;

  if (input.canonicalLiveSupplyBaseUnits < 0n) {
    errors.push("NEGATIVE_CANONICAL_SUPPLY");
  }
  if (input.lockedCanonicalBaseUnits < 0n) {
    errors.push("NEGATIVE_LOCKED_CANONICAL");
  }
  if (input.wrappedSupplyBaseUnits < 0n) {
    errors.push("NEGATIVE_WRAPPED_SUPPLY");
  }
  if (pendingToSui < 0n || pendingToSolana < 0n) {
    errors.push("NEGATIVE_PENDING_FLOW");
  }
  if (exposure < 0n) {
    errors.push("NEGATIVE_EFFECTIVE_WRAPPED_EXPOSURE");
  }
  if (exposure > input.lockedCanonicalBaseUnits) {
    errors.push(
      "WRAPPED_EXPOSURE_EXCEEDS_LOCKED_CANONICAL",
    );
  }
  if (exposure > input.canonicalLiveSupplyBaseUnits) {
    errors.push(
      "WRAPPED_EXPOSURE_EXCEEDS_LIVE_CANONICAL_SUPPLY",
    );
  }

  return {
    valid: errors.length === 0,
    effectiveWrappedExposureBaseUnits: exposure,
    backingSurplusBaseUnits:
      exposure >= 0n &&
      input.lockedCanonicalBaseUnits >= exposure
        ? input.lockedCanonicalBaseUnits - exposure
        : 0n,
    errors,
  };
}
