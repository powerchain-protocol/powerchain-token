export interface BridgeReconciliationInput {
  lockedCanonicalBaseUnits: bigint;
  suiWrappedSupplyBaseUnits: bigint;
  pendingSolanaToSuiBaseUnits: bigint;
  pendingSuiToSolanaBaseUnits: bigint;
}
export function reconcileBridgeBacking(input: BridgeReconciliationInput) {
  const errors: string[] = [];
  for (const [name,value] of Object.entries(input)) if (value < 0n) errors.push(`NEGATIVE:${name}`);
  const exposure = input.suiWrappedSupplyBaseUnits + input.pendingSolanaToSuiBaseUnits + input.pendingSuiToSolanaBaseUnits;
  if (exposure < 0n) errors.push("NEGATIVE_EFFECTIVE_WRAPPED_EXPOSURE");
  if (exposure > input.lockedCanonicalBaseUnits) errors.push("WRAPPED_EXPOSURE_EXCEEDS_LOCKED_CANONICAL");
  return { valid: errors.length===0, effectiveWrappedExposureBaseUnits: exposure, surplusBackingBaseUnits: exposure>=0n && input.lockedCanonicalBaseUnits>=exposure ? input.lockedCanonicalBaseUnits-exposure : 0n, errors };
}
