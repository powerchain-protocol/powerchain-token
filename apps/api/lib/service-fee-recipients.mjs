import {
  assertSolanaAddress,
} from "./fees.mjs";

export const POWERCHAIN_TRANSACTION_FEE_SOLANA =
  "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy";
export const POWERCHAIN_TRANSACTION_FEE_SUI =
  "0xc23c9622a09c5533fd18f35703622dc2df44206749a1761202d2024a04a36f50";

export function assertSuiAddress(
  value,
) {
  const normalized =
    value?.trim()?.toLowerCase();

  if (
    !normalized ||
    !/^0x[0-9a-f]{64}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      "PWRC_SUI_ADDRESS_INVALID",
    );
  }

  return normalized;
}

export function resolveServiceFeeRecipient(
  operation,
  env = process.env,
) {
  if (
    operation ===
      "bridge-solana-to-sui"
  ) {
    return assertSolanaAddress(
      env.POWERCHAIN_TRANSACTION_FEE_SOLANA ??
      POWERCHAIN_TRANSACTION_FEE_SOLANA,
    );
  }

  if (
    operation ===
      "bridge-sui-to-solana"
  ) {
    return assertSuiAddress(
      env.POWERCHAIN_TRANSACTION_FEE_SUI ??
      POWERCHAIN_TRANSACTION_FEE_SUI,
    );
  }

  return null;
}
