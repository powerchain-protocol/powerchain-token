import { PWRC_MAX_BASE_UNITS } from "../constants.js";

export const PWRC_QUARTERLY_BURN_BPS = 200n;
export const BPS_DENOMINATOR = 10_000n;

export interface QuarterlyBurnQuote {
  currentCanonicalSupplyBaseUnits: bigint;
  targetBurnBaseUnits: bigint;
  postBurnCanonicalSupplyBaseUnits: bigint;
}

export function quoteQuarterlyBurnFromLiveSupply(
  currentCanonicalSupplyBaseUnits: bigint,
): QuarterlyBurnQuote {
  if (
    currentCanonicalSupplyBaseUnits <= 0n ||
    currentCanonicalSupplyBaseUnits > PWRC_MAX_BASE_UNITS
  ) {
    throw new Error("PWRC_CANONICAL_SUPPLY_INVALID");
  }

  const targetBurnBaseUnits =
    currentCanonicalSupplyBaseUnits *
    PWRC_QUARTERLY_BURN_BPS /
    BPS_DENOMINATOR;

  if (targetBurnBaseUnits <= 0n) {
    throw new Error("PWRC_QUARTERLY_BURN_ROUNDS_TO_ZERO");
  }

  return {
    currentCanonicalSupplyBaseUnits,
    targetBurnBaseUnits,
    postBurnCanonicalSupplyBaseUnits:
      currentCanonicalSupplyBaseUnits - targetBurnBaseUnits,
  };
}

export function assertBurnSourceCanFundTarget(input: {
  targetBurnBaseUnits: bigint;
  controlledSourceBalanceBaseUnits: bigint;
}): void {
  if (input.controlledSourceBalanceBaseUnits < input.targetBurnBaseUnits) {
    throw new Error("PWRC_BURN_SOURCE_INSUFFICIENT");
  }
}

export function effectiveWrappedExposure(input: {
  suiWrappedSupplyBaseUnits: bigint;
  pendingSolanaToSuiBaseUnits: bigint;
  pendingSuiToSolanaBaseUnits: bigint;
}): bigint {
  const exposure =
    input.suiWrappedSupplyBaseUnits +
    input.pendingSolanaToSuiBaseUnits +
    input.pendingSuiToSolanaBaseUnits;

  if (exposure < 0n) throw new Error("WPWRC_EFFECTIVE_EXPOSURE_NEGATIVE");
  return exposure;
}

export function assertQuarterlyBurnCrossChainSafe(input: {
  postBurnCanonicalSupplyBaseUnits: bigint;
  solanaLockedBaseUnits: bigint;
  suiWrappedSupplyBaseUnits: bigint;
  pendingSolanaToSuiBaseUnits: bigint;
  pendingSuiToSolanaBaseUnits: bigint;
}): void {
  const exposure = effectiveWrappedExposure(input);

  if (exposure > input.solanaLockedBaseUnits) {
    throw new Error("WPWRC_EXPOSURE_EXCEEDS_LOCKED_CANONICAL");
  }
  if (exposure > input.postBurnCanonicalSupplyBaseUnits) {
    throw new Error("PWRC_BURN_WOULD_EXCEED_POST_BURN_CANONICAL_CEILING");
  }
}
