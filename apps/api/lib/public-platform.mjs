export function publicPlatformState(
  env = process.env,
) {
  return {
    version: "1.0.0",
    apiVersion: "v1",
    product: "PowerChain Token",
    canonicalAsset: {
      name: "PowerChain",
      symbol: "PWRC",
      chain: "solana",
      network: "mainnet-beta",
      mint:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      tokenProgram:
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
      metadataProgram:
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      decimals: 9,
    },
    wrappedAsset: {
      name: "Wrapped PowerChain",
      symbol: "wPWRC",
      chain: "sui",
      decimals: 9,
      genesisSupplyBaseUnits: "0",
    },
    features: {
      feeQuotes: true,
      bridgeQuotes: true,
      indexedSolanaData:
        Boolean(
          env.CDP_SQL_API_BEARER_TOKEN?.trim() ||
          env.CDP_SQL_API_TOKEN?.trim(),
        ),
      cdpUserWallet:
        env.POWERCHAIN_CDP_USER_WALLET_ENABLED === "true",
      bridgeWritesExposed: false,
      mainnetDeploymentWritesExposed: false,
    },
    documentation: {
      openapiJson: "/api/v1/openapi.json",
      openapiYaml: "/swagger/openapi.yaml",
      swagger: "/swagger",
    },
  };
}

export function publicFeePolicy(
  env = process.env,
) {
  const serviceEnabled =
    env.PWRC_SERVICE_FEE_ENABLED === "true";

  const serviceBps =
    Number(
      env.PWRC_SERVICE_FEE_BPS ??
      "250",
    );

  return {
    version: "1.0.0",
    nativeToken2022Fee: {
      basisPoints: 250,
      maximumFeeTokens: "1000000",
      maximumFeeBaseUnits:
        "1000000000000000",
    },
    serviceFee: {
      enabled:
        serviceEnabled,
      basisPoints:
        serviceEnabled
          ? serviceBps
          : 0,
      sourceDebits: {
        "bridge-solana-to-sui": {
          chain: "solana",
          asset: "PWRC",
          recipient:
            env.POWERCHAIN_TRANSACTION_FEE_SOLANA ??
            "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy",
        },
        "bridge-sui-to-solana": {
          chain: "sui",
          asset: "wPWRC",
          recipient:
            env.POWERCHAIN_TRANSACTION_FEE_SUI ??
            "0xc23c9622a09c5533fd18f35703622dc2df44206749a1761202d2024a04a36f50",
        },
      },
      scope: [
        "bridge-solana-to-sui",
        "bridge-sui-to-solana",
      ],
      separateFromPrincipal:
        true,
      neverReducesNttPrincipal:
        true,
      ordinaryWalletTransferExcluded:
        true,
    },
    networkFee: {
      separate:
        true,
    },
  };
}
