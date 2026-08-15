import {
  canonicalTokenSnapshot,
} from "./token-policy.mjs";
import {
  buildFeeQuote,
  parseBaseUnits,
} from "./fees.mjs";

export function bridgeStatus(
  env = process.env,
) {
  const cluster =
    env.PWRC_CLUSTER ??
    "localnet";
  const suiNetwork =
    env.SUI_NETWORK ??
    "devnet";

  const token =
    canonicalTokenSnapshot();

  return {
    version:
      token.version,
    enabled:
      env.PWRC_BRIDGE_EXECUTION_ENABLED === "true",
    executionMode:
      env.PWRC_BRIDGE_EXECUTION_ENABLED === "true"
        ? "server-gated"
        : "disabled",
    canonical: {
      chain: "solana",
      symbol:
        token.native.symbol,
      mint:
        token.native.mint,
      cluster,
    },
    wrapped: {
      chain:
        token.wrapped.chain,
      symbol:
        token.wrapped.symbol,
      network:
        suiNetwork,
      packageId:
        env.WPWRC_SUI_PACKAGE_ID ??
        null,
      bridgeControllerId:
        env.WPWRC_SUI_BRIDGE_CONTROLLER_ID ??
        null,
      genesisSupplyBaseUnits:
        "0",
    },
    supportedQuoteDirections: [
      "solana-to-sui",
      "sui-to-solana",
    ],
    writesExposedByThisApi:
      false,
  };
}

export function quoteSolanaToSuiBridge({
  amountBaseUnits,
  serviceEnabled,
  serviceBps,
  serviceRecipient,
  quoteTtlMs,
}) {
  const amount =
    parseBaseUnits(
      amountBaseUnits,
    );

  const fees =
    buildFeeQuote({
      amount,
      operation:
        "bridge-solana-to-sui",
      serviceEnabled,
      serviceBps,
      serviceRecipient,
      ttlMs:
        quoteTtlMs,
    });

  return {
    version:
      "1.0.0",
    direction:
      "solana-to-sui",
    canonical: {
      symbol:
        "PWRC",
      grossBaseUnits:
        fees.principalGrossBaseUnits,
      nativeTransferFeeBaseUnits:
        fees.nativeTransferFeeBaseUnits,
      lockedBackingBaseUnits:
        fees.principalNetBaseUnits,
    },
    wrapped: {
      symbol:
        "wPWRC",
      mintBaseUnits:
        fees.principalNetBaseUnits,
      ratio:
        "1:1-base-units",
    },
    fees,
  };
}


export function quoteSuiToSolanaBridge({
  amountBaseUnits,
  serviceEnabled,
  serviceBps,
  serviceRecipient,
  quoteTtlMs,
}) {
  const amount =
    parseBaseUnits(
      amountBaseUnits,
    );

  const fees =
    buildFeeQuote({
      amount,
      operation:
        "bridge-sui-to-solana",
      serviceEnabled,
      serviceBps,
      serviceRecipient,
      ttlMs:
        quoteTtlMs,
    });

  return {
    version:
      "1.0.0",
    direction:
      "sui-to-solana",
    wrapped: {
      symbol:
        "wPWRC",
      burnBaseUnits:
        fees.principalGrossBaseUnits,
      sourceNativeTransferFeeBaseUnits:
        fees.nativeTransferFeeBaseUnits,
    },
    canonical: {
      symbol:
        "PWRC",
      releaseGrossBaseUnits:
        fees.principalGrossBaseUnits,
      destinationNativeTransferFeeBaseUnits:
        fees.destinationNativeTransferFeeBaseUnits,
      recipientNetBaseUnits:
        fees.destinationNetBaseUnits,
      ratio:
        "1:1-base-units-before-token-2022-destination-fee",
    },
    fees,
  };
}
