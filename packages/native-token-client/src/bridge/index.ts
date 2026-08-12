import {
  PWRC_MAX_BASE_UNITS,
} from "../constants.js";
import {
  calculateNetAfterTransferFeeBaseUnits,
  calculateTransferFeeBaseUnits,
} from "../fees.js";
import {
  assertSolanaAddress,
} from "../validation/solana.js";
import {
  assertSuiAddress,
} from "../validation/sui.js";

export interface SolanaToSuiBridgeIntent {
  canonicalAmountBaseUnits: bigint;
  recipientSuiAddress: string;
}

export interface SuiToSolanaBridgeIntent {
  wrappedAmountBaseUnits: bigint;
  recipientSolanaAddress: string;
}

export function createSolanaToSuiBridgeIntent(
  input: SolanaToSuiBridgeIntent,
) {
  if (
    input.canonicalAmountBaseUnits <= 0n ||
    input.canonicalAmountBaseUnits >
      PWRC_MAX_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_BRIDGE_AMOUNT_INVALID",
    );
  }

  const transferFeeBaseUnits =
    calculateTransferFeeBaseUnits(
      input.canonicalAmountBaseUnits,
    );

  const wrappedAmountBaseUnits =
    calculateNetAfterTransferFeeBaseUnits(
      input.canonicalAmountBaseUnits,
    );

  if (wrappedAmountBaseUnits <= 0n) {
    throw new Error(
      "PWRC_BRIDGE_NET_AMOUNT_ZERO",
    );
  }

  return {
    direction: "solana-to-sui" as const,
    canonicalGrossAmountBaseUnits:
      input.canonicalAmountBaseUnits,
    transferFeeBaseUnits,
    canonicalLockedBaseUnits:
      wrappedAmountBaseUnits,
    wrappedAmountBaseUnits,
    recipientSuiAddress:
      assertSuiAddress(
        input.recipientSuiAddress,
      ),
    backingRatio: "1:1-net-locked" as const,
  };
}

export function createSuiToSolanaBridgeIntent(
  input: SuiToSolanaBridgeIntent,
) {
  if (
    input.wrappedAmountBaseUnits <= 0n ||
    input.wrappedAmountBaseUnits >
      PWRC_MAX_BASE_UNITS
  ) {
    throw new Error(
      "WPWRC_BRIDGE_AMOUNT_INVALID",
    );
  }

  const transferFeeBaseUnits =
    calculateTransferFeeBaseUnits(
      input.wrappedAmountBaseUnits,
    );

  const expectedRecipientNetBaseUnits =
    calculateNetAfterTransferFeeBaseUnits(
      input.wrappedAmountBaseUnits,
    );

  return {
    direction: "sui-to-solana" as const,
    wrappedAmountBaseUnits:
      input.wrappedAmountBaseUnits,
    canonicalGrossReleaseBaseUnits:
      input.wrappedAmountBaseUnits,
    transferFeeBaseUnits,
    expectedRecipientNetBaseUnits,
    recipientSolanaAddress:
      assertSolanaAddress(
        input.recipientSolanaAddress,
      ),
    backingRatio: "1:1-gross-release" as const,
  };
}
