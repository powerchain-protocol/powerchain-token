import {
  METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_GENESIS_SUPPLY,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_METADATA_IMAGE_URI,
  PWRC_METADATA_URI,
  PWRC_NAME,
  PWRC_SYMBOL,
  PWRC_TRANSFER_FEE_BPS,
  PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
  SOLANA_TOKEN_2022_PROGRAM_ID,
  U64_MAX,
  WPWRC_DECIMALS,
  WPWRC_GENESIS_SUPPLY_BASE_UNITS,
  WPWRC_METADATA_IMAGE_URI,
  WPWRC_METADATA_URI,
  WPWRC_NAME,
  WPWRC_SYMBOL,
} from "./constants.js";
import {
  canonicalJsonSha256,
} from "./helpers.js";
import {
  PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
} from "./native-token.js";

export const PWRC_TOKEN_POLICY = {
  version:
    "1.0.0",
  canonical:
    true,
  native: {
    chain:
      "solana",
    network:
      "mainnet-beta",
    name:
      PWRC_NAME,
    symbol:
      PWRC_SYMBOL,
    mint:
      PWRC_CANONICAL_MINT,
    standard:
      "Token-2022",
    tokenProgram:
      SOLANA_TOKEN_2022_PROGRAM_ID,
    decimals:
      PWRC_DECIMALS,
    fixedSupplyTokens:
      PWRC_GENESIS_SUPPLY
        .toString(),
    fixedSupplyBaseUnits:
      PWRC_GENESIS_BASE_UNITS
        .toString(),
    u64Max:
      U64_MAX
        .toString(),
    u64HeadroomBaseUnits:
      (
        U64_MAX -
        PWRC_GENESIS_BASE_UNITS
      ).toString(),
    extensions:
      [
        ...PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
      ],
    transferFee: {
      basisPoints:
        PWRC_TRANSFER_FEE_BPS
          .toString(),
      maximumFeeBaseUnits:
        PWRC_MAX_TRANSFER_FEE_BASE_UNITS
          .toString(),
      capStartsAtGrossBaseUnits:
        PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS
          .toString(),
      rounding:
        "ceil",
    },
    authorities: {
      mintAuthorityAfterGenesis:
        null,
      freezeAuthority:
        null,
      transferFeeAuthorities:
        "release-evidence-required",
    },
    metadata: {
      pointer:
        "self",
      uri:
        PWRC_METADATA_URI,
      image:
        PWRC_METADATA_IMAGE_URI,
      metaplexProgram:
        METAPLEX_TOKEN_METADATA_PROGRAM_ID,
    },
  },
  wrapped: {
    chain:
      "sui",
    network:
      "mainnet",
    name:
      WPWRC_NAME,
    symbol:
      WPWRC_SYMBOL,
    standard:
      "Sui Coin",
    decimals:
      WPWRC_DECIMALS,
    genesisSupplyBaseUnits:
      WPWRC_GENESIS_SUPPLY_BASE_UNITS
        .toString(),
    maxWrappedSupplyBaseUnits:
      PWRC_GENESIS_BASE_UNITS
        .toString(),
    canonicalBaseUnitsPerWrappedBaseUnit:
      "1",
    supplyModel:
      "mint-on-verified-lock-burn-before-release",
    metadata: {
      uri:
        WPWRC_METADATA_URI,
      image:
        WPWRC_METADATA_IMAGE_URI,
    },
  },
} as const;

export const PWRC_TOKEN_POLICY_EXPECTED_SHA256 =
  "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4" as const;

export const PWRC_TOKEN_POLICY_SHA256 =
  canonicalJsonSha256({
    domain:
      "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
    policy:
      PWRC_TOKEN_POLICY,
  });

export function assertCanonicalPwrcTokenPolicy(): void {
  if (
    PWRC_TOKEN_POLICY_SHA256 !==
      PWRC_TOKEN_POLICY_EXPECTED_SHA256
  ) {
    throw new Error(
      "PWRC_TOKEN_POLICY_COMMITMENT_MISMATCH",
    );
  }

  if (
    PWRC_TOKEN_POLICY.version !==
      "1.0.0" ||
    PWRC_TOKEN_POLICY.native.mint !==
      PWRC_CANONICAL_MINT ||
    PWRC_TOKEN_POLICY.native.fixedSupplyBaseUnits !==
      "18446000000000000000" ||
    PWRC_TOKEN_POLICY.native.transferFee.basisPoints !==
      "250" ||
    PWRC_TOKEN_POLICY.native.transferFee.maximumFeeBaseUnits !==
      "1000000000000000" ||
    PWRC_TOKEN_POLICY.native.transferFee.capStartsAtGrossBaseUnits !==
      "40000000000000000" ||
    PWRC_TOKEN_POLICY.wrapped.genesisSupplyBaseUnits !==
      "0" ||
    PWRC_TOKEN_POLICY.wrapped.canonicalBaseUnitsPerWrappedBaseUnit !==
      "1"
  ) {
    throw new Error(
      "PWRC_TOKEN_POLICY_CHANGED",
    );
  }
}
