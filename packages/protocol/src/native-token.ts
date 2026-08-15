import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
  PWRC_METADATA_URI,
  PWRC_NAME,
  PWRC_SYMBOL,
  PWRC_TRANSFER_FEE_BPS,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "./constants.js";
import {
  nativePwrcTransferFee,
} from "./fees.js";

export const PWRC_REQUIRED_TOKEN_2022_EXTENSIONS =
  [
    "TransferFeeConfig",
    "MetadataPointer",
    "TokenMetadata",
  ] as const;

export const PWRC_FORBIDDEN_TOKEN_2022_EXTENSIONS =
  [
    "PermanentDelegate",
    "MintCloseAuthority",
    "DefaultAccountState",
    "InterestBearingConfig",
    "ScaledUiAmount",
    "PausableConfig",
  ] as const;

export interface NativePwrcMintObservation {
  mint:
    string;
  ownerProgramId:
    string;
  decimals:
    number;
  supplyBaseUnits:
    bigint;
  mintAuthority:
    string |
    null;
  freezeAuthority:
    string |
    null;
  extensions:
    readonly string[];
  transferFeeBasisPoints:
    bigint;
  maximumTransferFeeBaseUnits:
    bigint;
  transferFeeConfigAuthority:
    string |
    null;
  withdrawWithheldAuthority:
    string |
    null;
  metadataPointer:
    string |
    null;
  metadataName:
    string;
  metadataSymbol:
    string;
  metadataUri:
    string;
}


export interface NativePwrcTransferFeeAuthorityPolicy {
  transferFeeConfigAuthority:
    string |
    null;
  withdrawWithheldAuthority:
    string |
    null;
}

export function verifyNativePwrcTransferFeeAuthorities(
  observation:
    NativePwrcMintObservation,
  policy:
    NativePwrcTransferFeeAuthorityPolicy,
): NativePwrcVerificationResult {
  const failures:
    string[] =
    [];

  if (
    observation.transferFeeConfigAuthority !==
      policy.transferFeeConfigAuthority
  ) {
    failures.push(
      "PWRC_NATIVE_TRANSFER_FEE_CONFIG_AUTHORITY_MISMATCH",
    );
  }

  if (
    observation.withdrawWithheldAuthority !==
      policy.withdrawWithheldAuthority
  ) {
    failures.push(
      "PWRC_NATIVE_WITHDRAW_WITHHELD_AUTHORITY_MISMATCH",
    );
  }

  return {
    version:
      "1.0.0",
    valid:
      failures.length ===
      0,
    failures,
  };
}

export interface NativePwrcVerificationResult {
  version:
    "1.0.0";
  valid:
    boolean;
  failures:
    readonly string[];
}

export function verifyNativePwrcMintObservation(
  observation:
    NativePwrcMintObservation,
): NativePwrcVerificationResult {
  const failures:
    string[] =
    [];

  if (
    observation.mint !==
      PWRC_CANONICAL_MINT
  ) {
    failures.push(
      "PWRC_NATIVE_MINT_MISMATCH",
    );
  }

  if (
    observation.ownerProgramId !==
      SOLANA_TOKEN_2022_PROGRAM_ID
  ) {
    failures.push(
      "PWRC_NATIVE_TOKEN_PROGRAM_MISMATCH",
    );
  }

  if (
    observation.decimals !==
      PWRC_DECIMALS
  ) {
    failures.push(
      "PWRC_NATIVE_DECIMALS_MISMATCH",
    );
  }

  if (
    observation.supplyBaseUnits !==
      PWRC_GENESIS_BASE_UNITS
  ) {
    failures.push(
      "PWRC_NATIVE_SUPPLY_MISMATCH",
    );
  }

  if (
    observation.mintAuthority !==
      null
  ) {
    failures.push(
      "PWRC_NATIVE_MINT_AUTHORITY_PRESENT",
    );
  }

  if (
    observation.freezeAuthority !==
      null
  ) {
    failures.push(
      "PWRC_NATIVE_FREEZE_AUTHORITY_PRESENT",
    );
  }

  const extensionSet =
    new Set(
      observation.extensions,
    );

  for (
    const required of
      PWRC_REQUIRED_TOKEN_2022_EXTENSIONS
  ) {
    if (
      !extensionSet.has(
        required,
      )
    ) {
      failures.push(
        `PWRC_NATIVE_EXTENSION_REQUIRED:${required}`,
      );
    }
  }


if (
  extensionSet.size !==
    observation.extensions.length
) {
  failures.push(
    "PWRC_NATIVE_EXTENSION_DUPLICATE",
  );
}

const allowedExtensions =
  new Set<string>(
    PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
  );

for (
  const extension of
    extensionSet
) {
  if (
    !allowedExtensions.has(
      extension,
    )
  ) {
    failures.push(
      `PWRC_NATIVE_EXTENSION_UNEXPECTED:${extension}`,
    );
  }
}

  for (
    const forbidden of
      PWRC_FORBIDDEN_TOKEN_2022_EXTENSIONS
  ) {
    if (
      extensionSet.has(
        forbidden,
      )
    ) {
      failures.push(
        `PWRC_NATIVE_EXTENSION_FORBIDDEN:${forbidden}`,
      );
    }
  }

  if (
    observation.transferFeeBasisPoints !==
      PWRC_TRANSFER_FEE_BPS
  ) {
    failures.push(
      "PWRC_NATIVE_TRANSFER_FEE_BPS_MISMATCH",
    );
  }

  if (
    observation.maximumTransferFeeBaseUnits !==
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS
  ) {
    failures.push(
      "PWRC_NATIVE_TRANSFER_FEE_CAP_MISMATCH",
    );
  }

  if (
    observation.metadataPointer !==
      PWRC_CANONICAL_MINT
  ) {
    failures.push(
      "PWRC_NATIVE_METADATA_POINTER_MISMATCH",
    );
  }

  if (
    observation.metadataName !==
      PWRC_NAME
  ) {
    failures.push(
      "PWRC_NATIVE_METADATA_NAME_MISMATCH",
    );
  }

  if (
    observation.metadataSymbol !==
      PWRC_SYMBOL
  ) {
    failures.push(
      "PWRC_NATIVE_METADATA_SYMBOL_MISMATCH",
    );
  }

  if (
    observation.metadataUri !==
      PWRC_METADATA_URI
  ) {
    failures.push(
      "PWRC_NATIVE_METADATA_URI_MISMATCH",
    );
  }

  return {
    version:
      "1.0.0",
    valid:
      failures.length ===
      0,
    failures,
  };
}

export function nativePwrcTransferPreview(
  grossBaseUnits:
    bigint,
) {
  if (
    grossBaseUnits <=
      0n ||
    grossBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_NATIVE_TRANSFER_AMOUNT_INVALID",
    );
  }

  const nativeTransferFeeBaseUnits =
    nativePwrcTransferFee(
      grossBaseUnits,
    );

  return {
    version:
      "1.0.0" as const,
    grossBaseUnits,
    nativeTransferFeeBaseUnits,
    netBaseUnits:
      grossBaseUnits -
      nativeTransferFeeBaseUnits,
    feeAtMaximum:
      nativeTransferFeeBaseUnits ===
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
    feeCapped:
      grossBaseUnits >=
      PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
    feeCapStartsAtGrossBaseUnits:
      PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
  };
}
