import { PWRC_MAX_BASE_UNITS } from "./constants.js";
import { nativePwrcTransferFee } from "./fees.js";

export interface SolanaToSuiBridgeQuote {
  direction: "solana-to-sui";
  canonicalGrossBaseUnits: bigint;
  nativeTransferFeeBaseUnits: bigint;
  canonicalLockedBaseUnits: bigint;
  wrappedMintBaseUnits: bigint;
}

export function quoteSolanaToSuiBridge(
  grossBaseUnits: bigint,
): SolanaToSuiBridgeQuote {
  const fee = nativePwrcTransferFee(grossBaseUnits);
  const net = grossBaseUnits - fee;
  return {
    direction: "solana-to-sui",
    canonicalGrossBaseUnits: grossBaseUnits,
    nativeTransferFeeBaseUnits: fee,
    canonicalLockedBaseUnits: net,
    wrappedMintBaseUnits: net,
  };
}

export function assertBridgeConservation(input: {
  canonicalLockedBaseUnits: bigint;
  wrappedSupplyBaseUnits: bigint;
  pendingSolanaToSuiBaseUnits?: bigint;
  pendingSuiToSolanaBaseUnits?: bigint;
}): void {
  const pendingOut = input.pendingSuiToSolanaBaseUnits ?? 0n;
  const exposure = input.wrappedSupplyBaseUnits + pendingOut;
  if (exposure > input.canonicalLockedBaseUnits) {
    throw new Error("PWRC_BRIDGE_UNDERCOLLATERALIZED");
  }
  if (
    input.wrappedSupplyBaseUnits < 0n ||
    input.wrappedSupplyBaseUnits > PWRC_MAX_BASE_UNITS
  ) {
    throw new Error("PWRC_WRAPPED_SUPPLY_INVALID");
  }
}
