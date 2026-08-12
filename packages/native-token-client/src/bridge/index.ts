import {
  PWRC_MAX_BASE_UNITS,
} from "../constants.js";
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

  return {
    direction: "solana-to-sui" as const,
    canonicalAmountBaseUnits:
      input.canonicalAmountBaseUnits,
    wrappedAmountBaseUnits:
      input.canonicalAmountBaseUnits,
    recipientSuiAddress:
      assertSuiAddress(
        input.recipientSuiAddress,
      ),
    ratio: "1:1" as const,
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

  return {
    direction: "sui-to-solana" as const,
    wrappedAmountBaseUnits:
      input.wrappedAmountBaseUnits,
    canonicalAmountBaseUnits:
      input.wrappedAmountBaseUnits,
    recipientSolanaAddress:
      assertSolanaAddress(
        input.recipientSolanaAddress,
      ),
    ratio: "1:1" as const,
  };
}
