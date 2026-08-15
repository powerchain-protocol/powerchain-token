import {
  PWRC_MAX_BASE_UNITS,
} from "./constants.js";
import {
  nativePwrcTransferFee,
} from "./fees.js";

export interface SolanaToSuiBridgeQuote {
  direction:
    "solana-to-sui";
  canonicalGrossBaseUnits:
    bigint;
  nativeTransferFeeBaseUnits:
    bigint;
  canonicalLockedBaseUnits:
    bigint;
  wrappedMintBaseUnits:
    bigint;
}

export interface SuiToSolanaBridgeQuote {
  direction:
    "sui-to-solana";
  wrappedBurnBaseUnits:
    bigint;
  canonicalReleaseGrossBaseUnits:
    bigint;
  destinationNativeTransferFeeBaseUnits:
    bigint;
  canonicalRecipientNetBaseUnits:
    bigint;
}

function assertBridgeAmount(
  amount:
    bigint,
): void {
  if (
    amount <= 0n ||
    amount >
      PWRC_MAX_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_BRIDGE_AMOUNT_INVALID",
    );
  }
}

export function quoteSolanaToSuiBridge(
  grossBaseUnits:
    bigint,
): SolanaToSuiBridgeQuote {
  assertBridgeAmount(
    grossBaseUnits,
  );

  const fee =
    nativePwrcTransferFee(
      grossBaseUnits,
    );
  const net =
    grossBaseUnits -
    fee;

  return {
    direction:
      "solana-to-sui",
    canonicalGrossBaseUnits:
      grossBaseUnits,
    nativeTransferFeeBaseUnits:
      fee,
    canonicalLockedBaseUnits:
      net,
    wrappedMintBaseUnits:
      net,
  };
}

export function quoteSuiToSolanaBridge(
  wrappedBurnBaseUnits:
    bigint,
): SuiToSolanaBridgeQuote {
  assertBridgeAmount(
    wrappedBurnBaseUnits,
  );

  const destinationNativeTransferFeeBaseUnits =
    nativePwrcTransferFee(
      wrappedBurnBaseUnits,
    );

  return {
    direction:
      "sui-to-solana",
    wrappedBurnBaseUnits,
    canonicalReleaseGrossBaseUnits:
      wrappedBurnBaseUnits,
    destinationNativeTransferFeeBaseUnits,
    canonicalRecipientNetBaseUnits:
      wrappedBurnBaseUnits -
      destinationNativeTransferFeeBaseUnits,
  };
}

export interface BridgeConservationInput {
  canonicalLockedBaseUnits:
    bigint;
  wrappedSupplyBaseUnits:
    bigint;
  pendingSolanaToSuiBaseUnits?:
    bigint;
  pendingSuiToSolanaBaseUnits?:
    bigint;
}

export interface BridgeConservationState {
  canonicalLockedBaseUnits:
    bigint;
  wrappedSupplyBaseUnits:
    bigint;
  pendingSolanaToSuiBaseUnits:
    bigint;
  pendingSuiToSolanaBaseUnits:
    bigint;
  effectiveWrappedExposureBaseUnits:
    bigint;
  availableBackingBaseUnits:
    bigint;
}

export function bridgeConservationState(
  input:
    BridgeConservationInput,
): BridgeConservationState {
  const pendingIn =
    input
      .pendingSolanaToSuiBaseUnits ??
    0n;
  const pendingOut =
    input
      .pendingSuiToSolanaBaseUnits ??
    0n;

  for (const amount of [
    input.canonicalLockedBaseUnits,
    input.wrappedSupplyBaseUnits,
    pendingIn,
    pendingOut,
  ]) {
    if (
      amount < 0n ||
      amount >
        PWRC_MAX_BASE_UNITS
    ) {
      throw new Error(
        "PWRC_BRIDGE_CONSERVATION_AMOUNT_INVALID",
      );
    }
  }

  if (
    pendingOut >
      input.wrappedSupplyBaseUnits
  ) {
    throw new Error(
      "PWRC_BRIDGE_PENDING_BURN_EXCEEDS_WRAPPED_SUPPLY",
    );
  }

  const effectiveWrappedExposureBaseUnits =
    input
      .wrappedSupplyBaseUnits -
    pendingOut +
    pendingIn;

  const availableBackingBaseUnits =
    input
      .canonicalLockedBaseUnits -
    (
      effectiveWrappedExposureBaseUnits >
      input
        .canonicalLockedBaseUnits
        ? input
            .canonicalLockedBaseUnits
        : effectiveWrappedExposureBaseUnits
    );

  return {
    canonicalLockedBaseUnits:
      input
        .canonicalLockedBaseUnits,
    wrappedSupplyBaseUnits:
      input
        .wrappedSupplyBaseUnits,
    pendingSolanaToSuiBaseUnits:
      pendingIn,
    pendingSuiToSolanaBaseUnits:
      pendingOut,
    effectiveWrappedExposureBaseUnits,
    availableBackingBaseUnits,
  };
}

export function assertBridgeConservation(
  input:
    BridgeConservationInput,
): void {
  const state =
    bridgeConservationState(
      input,
    );

  if (
    state
      .effectiveWrappedExposureBaseUnits >
    state
      .canonicalLockedBaseUnits
  ) {
    throw new Error(
      "PWRC_BRIDGE_UNDERCOLLATERALIZED",
    );
  }
}
