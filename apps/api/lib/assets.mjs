import fs from "node:fs";
import {
  canonicalTokenPolicy,
} from "./token-policy.mjs";

const document =
  JSON.parse(
    fs.readFileSync(
      "config/assets.json",
      "utf8",
    ),
  );

const tokenPolicy =
  canonicalTokenPolicy();

if (
  document.version !==
    "1.0.0" ||
  document.canonical !==
    true
) {
  throw new Error(
    "PWRC_ASSET_REGISTRY_INVALID",
  );
}

if (
  document.tokenPolicy?.sha256 !==
    tokenPolicy.policySha256 ||
  document.tokenPolicy?.domain !==
    tokenPolicy.policyDomain
) {
  throw new Error(
    "PWRC_ASSET_REGISTRY_POLICY_MISMATCH",
  );
}

function normalizeAsset(
  symbol,
  asset,
) {
  const wrapped =
    asset.wrapped ===
      true;
  const canonical =
    symbol ===
      "PWRC";

  return {
    id:
      `${asset.chain}:${asset.network}:${symbol}`,
    version:
      "1.0.0",
    name:
      asset.name,
    symbol,
    description:
      asset.description ??
      null,
    descriptionPolicySha256:
      asset.descriptionPolicySha256 ??
      null,
    chain:
      asset.chain,
    network:
      asset.network,
    standard:
      asset.standard,
    decimals:
      asset.decimals,
    canonical,
    wrapped,
    canonicalAsset:
      canonical
        ? "PWRC"
        : asset.canonicalAsset ??
          "PWRC",
    canonicalSupplyOrigin:
      canonical
        ? "solana:PWRC"
        : asset.canonicalSupplyOrigin ??
          null,
    mint:
      asset.mint ??
      null,
    tokenProgram:
      asset.tokenProgram ??
      null,
    fixedSupply:
      asset.fixedSupply ===
        true,
    supplyBaseUnits:
      asset.supplyBaseUnits ??
      null,
    genesisSupplyBaseUnits:
      asset.genesisSupplyBaseUnits ??
      null,
    maxWrappedSupplyBaseUnits:
      asset.maxWrappedSupplyBaseUnits ??
      null,
    canonicalBaseUnitsPerWrappedBaseUnit:
      asset.canonicalBaseUnitsPerWrappedBaseUnit ??
      null,
    supplyModel:
      asset.supplyModel ??
      null,
    extensions:
      Array.isArray(
        asset.extensions,
      )
        ? [
            ...asset.extensions,
          ]
        : [],
    metadata:
      asset.metadata,
    image:
      asset.image,
    imageSha256:
      asset.imageSha256 ??
      null,
    localAssetPath:
      asset.localAssetPath ??
      null,
    tokenPolicySha256:
      tokenPolicy.policySha256,
    publicWrites:
      false,
  };
}

const assets =
  Object.freeze(
    Object.entries(
      document.assets,
    ).map(
      ([
        symbol,
        asset,
      ]) =>
        Object.freeze(
          normalizeAsset(
            symbol,
            asset,
          ),
        ),
    ),
  );

const byNormalizedSymbol =
  new Map(
    assets.map(
      (asset) => [
        asset.symbol
          .toLowerCase(),
        asset,
      ],
    ),
  );

export function publicAssetRegistry() {
  return {
    version:
      "1.0.0",
    canonical:
      true,
    tokenPolicyDomain:
      tokenPolicy.policyDomain,
    tokenPolicySha256:
      tokenPolicy.policySha256,
    count:
      assets.length,
    canonicalSymbol:
      "PWRC",
    assets:
      assets.map(
        (asset) => ({
          ...asset,
          extensions: [
            ...asset.extensions,
          ],
        }),
      ),
    publicWrites:
      false,
  };
}

export function publicAssetBySymbol(
  symbol,
) {
  const normalized =
    typeof symbol ===
      "string"
      ? symbol
          .trim()
          .toLowerCase()
      : "";

  if (
    !/^[a-z0-9]{2,16}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      "PWRC_ASSET_SYMBOL_INVALID",
    );
  }

  const asset =
    byNormalizedSymbol.get(
      normalized,
    );

  if (!asset) {
    return null;
  }

  return {
    ...asset,
    extensions: [
      ...asset.extensions,
    ],
  };
}

export function powerChainTokenApiIndex() {
  return {
    version:
      "1.0.0",
    apiVersion:
      "v1",
    product:
      "PowerChain Token API",
    resource:
      "PWRC",
    canonical:
      true,
    tokenPolicySha256:
      tokenPolicy.policySha256,
    endpoints: {
      profile:
        "/api/v1/token",
      policy:
        "/api/v1/token/policy",
      metadata:
        "/api/v1/token/metadata",
      description:
        "/api/v1/token/description",
      fees:
        "/api/v1/token/fees",
      transferPolicy:
        "/api/v1/token/transfer-policy",
      utilityPolicy:
        "/api/v1/token/utility-policy",
      nativePolicy:
        "/api/v1/token/native-policy",
      nativeVerification:
        "/api/v1/token/native-verification",
      nativeAttestation:
        "/api/v1/token/native-attestation",
      assets:
        "/api/v1/assets",
      openapi:
        "/api/v1/openapi.json",
    },
    publicWrites:
      false,
  };
}
