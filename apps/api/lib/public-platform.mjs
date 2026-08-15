import {
  canonicalTokenPolicy,
} from "./token-policy.mjs";

export function publicPlatformState(
  env = process.env,
) {
  return {
    version: "1.0.0",
    apiVersion: "v1",
    product: "PowerChain Token",
    canonicalAsset: {
      name:
        canonicalTokenPolicy()
          .native.name,
      symbol:
        canonicalTokenPolicy()
          .native.symbol,
      chain:
        canonicalTokenPolicy()
          .native.chain,
      network:
        canonicalTokenPolicy()
          .native.network,
      mint:
        canonicalTokenPolicy()
          .native.mint,
      tokenProgram:
        canonicalTokenPolicy()
          .native.tokenProgram,
      metadataProgram:
        canonicalTokenPolicy()
          .native.metadata
          .metaplexProgram,
      decimals:
        canonicalTokenPolicy()
          .native.decimals,
      tokenPolicySha256:
        canonicalTokenPolicy()
          .policySha256,
    },
    wrappedAsset: {
      name:
        canonicalTokenPolicy()
          .wrapped.name,
      symbol:
        canonicalTokenPolicy()
          .wrapped.symbol,
      chain:
        canonicalTokenPolicy()
          .wrapped.chain,
      network:
        canonicalTokenPolicy()
          .wrapped.network,
      decimals:
        canonicalTokenPolicy()
          .wrapped.decimals,
      genesisSupplyBaseUnits:
        canonicalTokenPolicy()
          .wrapped.genesisSupplyBaseUnits,
      tokenPolicySha256:
        canonicalTokenPolicy()
          .policySha256,
    },
    features: {
      feeQuotes: true,
      bridgeQuotes: true,
      indexedSolanaData:
        Boolean(
          env.CDP_SQL_API_BEARER_TOKEN?.trim() ||
          env.CDP_SQL_API_TOKEN?.trim(),
        ),
      helius:
        env.HELIUS_ENABLED === "true" &&
        Boolean(
          env.HELIUS_API_KEY?.trim(),
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

  const tokenPolicy =
    canonicalTokenPolicy();
  const native =
    tokenPolicy.native;

  return {
    version: "1.0.0",
    tokenPolicySha256:
      tokenPolicy.policySha256,
    nativeToken2022Fee: {
      basisPoints:
        Number(
          native.transferFee.basisPoints,
        ),
      maximumFeeTokens:
        (
          BigInt(
            native.transferFee.maximumFeeBaseUnits,
          ) /
          1_000_000_000n
        ).toString(),
      maximumFeeBaseUnits:
        native.transferFee.maximumFeeBaseUnits,
      feeCapStartsAtGrossBaseUnits:
        native.transferFee.capStartsAtGrossBaseUnits,
      rounding:
        native.transferFee.rounding,
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
