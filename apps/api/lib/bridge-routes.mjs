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

  return {
    version: "1.0.0",
    enabled:
      env.PWRC_BRIDGE_EXECUTION_ENABLED === "true",
    executionMode:
      env.PWRC_BRIDGE_EXECUTION_ENABLED === "true"
        ? "server-gated"
        : "disabled",
    canonical: {
      chain: "solana",
      symbol: "PWRC",
      mint:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      cluster,
    },
    wrapped: {
      chain: "sui",
      symbol: "wPWRC",
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
