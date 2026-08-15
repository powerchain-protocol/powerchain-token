import {
  METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_METADATA_URI,
  PWRC_NAME,
  PWRC_SYMBOL,
  PWRC_TRANSFER_FEE_BPS,
  PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "./constants.js";
import {
  PWRC_FORBIDDEN_TOKEN_2022_EXTENSIONS,
  PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
} from "./native-token.js";
import {
  canonicalJsonSha256,
} from "./helpers.js";

export const PWRC_VERIFIER_PROGRAM_ID =
  "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu";

export function nativePwrcPolicyPayload() {
  return {
    version:
      "1.0.0" as const,
    name:
      PWRC_NAME,
    symbol:
      PWRC_SYMBOL,
    chain:
      "solana" as const,
    cluster:
      "mainnet-beta" as const,
    standard:
      "Token-2022" as const,
    mint:
      PWRC_CANONICAL_MINT,
    tokenProgramId:
      SOLANA_TOKEN_2022_PROGRAM_ID,
    metaplexProgramId:
      METAPLEX_TOKEN_METADATA_PROGRAM_ID,
    decimals:
      PWRC_DECIMALS,
    fixedSupply:
      "18446000000",
    fixedSupplyBaseUnits:
      PWRC_GENESIS_BASE_UNITS
        .toString(),
    authorities: {
      mint:
        null,
      freeze:
        null,
    },
    extensions: {
      required:
        [...PWRC_REQUIRED_TOKEN_2022_EXTENSIONS],
      forbidden:
        [...PWRC_FORBIDDEN_TOKEN_2022_EXTENSIONS],
    },
    nativeTransferFee: {
      basisPoints:
        Number(
          PWRC_TRANSFER_FEE_BPS,
        ),
      percent:
        "2.5",
      maximumFeePwrc:
        "1000000",
      maximumFeeBaseUnits:
        PWRC_MAX_TRANSFER_FEE_BASE_UNITS
          .toString(),
      capStartsAtPwrc:
        "40000000",
      capStartsAtBaseUnits:
        PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS
          .toString(),
      rounding:
        "ceil" as const,
    },
    metadata: {
      pointer:
        "self" as const,
      name:
        PWRC_NAME,
      symbol:
        PWRC_SYMBOL,
      uri:
        PWRC_METADATA_URI,
    },
    verifier: {
      programId:
        PWRC_VERIFIER_PROGRAM_ID,
      verificationOnly:
        true,
      mintInstruction:
        false,
    },
    publicWrites:
      false,
  };
}

export function nativePwrcPolicySha256(): string {
  return canonicalJsonSha256({
    domain:
      "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
    policy:
      nativePwrcPolicyPayload(),
  });
}
