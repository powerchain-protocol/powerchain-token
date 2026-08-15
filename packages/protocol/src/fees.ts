import {
  PWRC_GENESIS_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_SERVICE_FEE_BPS_DEFAULT,
  PWRC_TRANSFER_FEE_BPS,
} from "./constants.js";
import {
  assertSolana32ByteBase58,
} from "./helpers.js";

export const BPS_DENOMINATOR =
  10_000n;

export type FeeOperation =
  | "bridge-solana-to-sui"
  | "bridge-sui-to-solana"
  | "wallet-transfer"
  | "read-only"
  | "quote-preview"
  | "signature-only";

export interface ServiceFeePolicy {
  enabled: boolean;
  basisPoints?: bigint;
  recipient?: string;
}

export interface FeeQuote {
  version: "1.0.0";
  operation: FeeOperation;
  principalSourceChain:
    "solana" |
    "sui" |
    null;
  principalSourceAsset:
    "PWRC" |
    "wPWRC" |
    null;
  principalGrossBaseUnits:
    bigint;
  nativeTransferFeeBaseUnits:
    bigint;
  principalNetBaseUnits:
    bigint;
  destinationNativeTransferFeeBaseUnits:
    bigint;
  destinationNetBaseUnits:
    bigint;
  serviceFeeEnabled:
    boolean;
  serviceFeeBasisPoints:
    bigint;
  serviceFeeNetBaseUnits:
    bigint;
  serviceFeeGrossTransferBaseUnits:
    bigint;
  serviceFeeTransferNativeFeeBaseUnits:
    bigint;
  serviceFeeRecipient:
    string |
    null;
  serviceFeeSourceChain:
    "solana" |
    "sui" |
    null;
  serviceFeeAsset:
    "PWRC" |
    "wPWRC" |
    null;
  totalNativeTokenFeesBaseUnits:
    bigint;
  totalSourceDebitBaseUnits:
    bigint;
  totalWalletPwrcDebitBaseUnits:
    bigint;
  networkFeeLamports:
    bigint |
    null;
}

const SERVICE_OPERATIONS =
  new Set<FeeOperation>([
    "bridge-solana-to-sui",
    "bridge-sui-to-solana",
  ]);

export function ceilDiv(
  a:
    bigint,
  b:
    bigint,
): bigint {
  if (
    a < 0n ||
    b <= 0n
  ) {
    throw new Error(
      "PWRC_DIVISION_INVALID",
    );
  }

  return (
    a + b - 1n
  ) / b;
}

export function nativePwrcTransferFee(
  gross:
    bigint,
): bigint {
  if (
    gross <=
      0n ||
    gross >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_GROSS_AMOUNT_INVALID",
    );
  }

  const fee =
    ceilDiv(
      gross *
        PWRC_TRANSFER_FEE_BPS,
      BPS_DENOMINATOR,
    );

  return fee >
    PWRC_MAX_TRANSFER_FEE_BASE_UNITS
    ? PWRC_MAX_TRANSFER_FEE_BASE_UNITS
    : fee;
}

export function grossUpPwrcForNet(
  net:
    bigint,
): {
  grossBaseUnits:
    bigint;
  nativeFeeBaseUnits:
    bigint;
  netBaseUnits:
    bigint;
} {
  if (
    net <
      0n ||
    net >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_NET_AMOUNT_INVALID",
    );
  }

  if (net === 0n) {
    return {
      grossBaseUnits:
        0n,
      nativeFeeBaseUnits:
        0n,
      netBaseUnits:
        0n,
    };
  }

  const maximumNetBaseUnits =
    PWRC_GENESIS_BASE_UNITS -
    nativePwrcTransferFee(
      PWRC_GENESIS_BASE_UNITS,
    );

  if (
    net >
      maximumNetBaseUnits
  ) {
    throw new Error(
      "PWRC_NET_AMOUNT_UNACHIEVABLE",
    );
  }

  let low =
    net;
  let high =
    PWRC_GENESIS_BASE_UNITS;

  while (low < high) {
    const middle =
      (
        low + high
      ) / 2n;
    const fee =
      nativePwrcTransferFee(
        middle,
      );

    if (
      middle - fee >=
      net
    ) {
      high =
        middle;
    } else {
      low =
        middle + 1n;
    }
  }

  const nativeFeeBaseUnits =
    nativePwrcTransferFee(
      low,
    );

  return {
    grossBaseUnits:
      low,
    nativeFeeBaseUnits,
    netBaseUnits:
      low -
      nativeFeeBaseUnits,
  };
}


function assertSuiCanonicalAddress(
  value:
    string,
  code:
    string,
): string {
  const normalized =
    value.trim()
      .toLowerCase();

  if (
    !/^0x[0-9a-f]{64}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      code,
    );
  }

  return normalized;
}

function validatedServiceFeeRecipient(
  chain:
    "solana" |
    "sui",
  value:
    string,
): string {
  return chain ===
    "solana"
    ? assertSolana32ByteBase58(
        value,
        "PWRC_SERVICE_FEE_RECIPIENT_INVALID",
      )
    : assertSuiCanonicalAddress(
        value,
        "PWRC_SERVICE_FEE_RECIPIENT_INVALID",
      );
}

export function quoteFees(
  input: {
    operation:
      FeeOperation;
    principalGrossBaseUnits:
      bigint;
    serviceFee:
      ServiceFeePolicy;
    networkFeeLamports?:
      bigint;
  },
): FeeQuote {
  if (
    input
      .principalGrossBaseUnits <=
      0n ||
    input
      .principalGrossBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_PRINCIPAL_INVALID",
    );
  }

  if (
    input.networkFeeLamports !==
      undefined &&
    input.networkFeeLamports <
      0n
  ) {
    throw new Error(
      "PWRC_NETWORK_FEE_INVALID",
    );
  }

  const isSolanaSource =
    input.operation ===
      "bridge-solana-to-sui" ||
    input.operation ===
      "wallet-transfer" ||
    input.operation ===
      "quote-preview";

  const isSuiSource =
    input.operation ===
      "bridge-sui-to-solana";

  const principalSourceChain =
    isSolanaSource
      ? "solana"
      : isSuiSource
        ? "sui"
        : null;

  const principalSourceAsset =
    principalSourceChain ===
      "solana"
      ? "PWRC"
      : principalSourceChain ===
          "sui"
        ? "wPWRC"
        : null;

  const nativeTransferFeeBaseUnits =
    isSolanaSource
      ? nativePwrcTransferFee(
          input
            .principalGrossBaseUnits,
        )
      : 0n;

  const principalNetBaseUnits =
    input
      .principalGrossBaseUnits -
    nativeTransferFeeBaseUnits;

  const destinationNativeTransferFeeBaseUnits =
    input.operation ===
      "bridge-sui-to-solana"
      ? nativePwrcTransferFee(
          input
            .principalGrossBaseUnits,
        )
      : 0n;

  const destinationNetBaseUnits =
    input.operation ===
      "bridge-sui-to-solana"
      ? input
          .principalGrossBaseUnits -
        destinationNativeTransferFeeBaseUnits
      : principalNetBaseUnits;

  const allowed =
    SERVICE_OPERATIONS.has(
      input.operation,
    );
  const serviceFeeEnabled =
    allowed &&
    input.serviceFee.enabled;
  const serviceFeeBasisPoints =
    serviceFeeEnabled
      ? input
          .serviceFee
          .basisPoints ??
        PWRC_SERVICE_FEE_BPS_DEFAULT
      : 0n;

  const serviceFeeSourceChain =
    serviceFeeEnabled
      ? input.operation ===
          "bridge-solana-to-sui"
        ? "solana"
        : "sui"
      : null;

  const serviceFeeAsset =
    serviceFeeSourceChain ===
      "solana"
      ? "PWRC"
      : serviceFeeSourceChain ===
          "sui"
        ? "wPWRC"
        : null;

  if (
    serviceFeeBasisPoints <
      0n ||
    serviceFeeBasisPoints >
      BPS_DENOMINATOR
  ) {
    throw new Error(
      "PWRC_SERVICE_FEE_BPS_INVALID",
    );
  }

  if (
    serviceFeeEnabled &&
    !input
      .serviceFee
      .recipient
      ?.trim()
  ) {
    throw new Error(
      "PWRC_SERVICE_FEE_RECIPIENT_REQUIRED",
    );
  }

  const serviceFeeRecipient =
    serviceFeeEnabled
      ? validatedServiceFeeRecipient(
          serviceFeeSourceChain!,
          input.serviceFee.recipient!,
        )
      : null;

  const serviceFeeNetBaseUnits =
    serviceFeeEnabled
      ? ceilDiv(
          input
            .principalGrossBaseUnits *
            serviceFeeBasisPoints,
          BPS_DENOMINATOR,
        )
      : 0n;

  const serviceTransfer =
    serviceFeeSourceChain ===
      "solana"
      ? grossUpPwrcForNet(
          serviceFeeNetBaseUnits,
        )
      : {
          grossBaseUnits:
            serviceFeeNetBaseUnits,
          nativeFeeBaseUnits:
            0n,
          netBaseUnits:
            serviceFeeNetBaseUnits,
        };

  const totalSourceDebitBaseUnits =
    input
      .principalGrossBaseUnits +
    serviceTransfer
      .grossBaseUnits;

  if (
    totalSourceDebitBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_TOTAL_SOURCE_DEBIT_EXCEEDS_SUPPLY",
    );
  }

  return {
    version:
      "1.0.0",
    operation:
      input.operation,
    principalSourceChain,
    principalSourceAsset,
    principalGrossBaseUnits:
      input
        .principalGrossBaseUnits,
    nativeTransferFeeBaseUnits,
    principalNetBaseUnits,
    destinationNativeTransferFeeBaseUnits,
    destinationNetBaseUnits,
    serviceFeeEnabled,
    serviceFeeBasisPoints,
    serviceFeeNetBaseUnits,
    serviceFeeGrossTransferBaseUnits:
      serviceTransfer
        .grossBaseUnits,
    serviceFeeTransferNativeFeeBaseUnits:
      serviceTransfer
        .nativeFeeBaseUnits,
    serviceFeeRecipient,
    serviceFeeSourceChain,
    serviceFeeAsset,
    totalNativeTokenFeesBaseUnits:
      nativeTransferFeeBaseUnits +
      destinationNativeTransferFeeBaseUnits +
      serviceTransfer
        .nativeFeeBaseUnits,
    totalSourceDebitBaseUnits,
    totalWalletPwrcDebitBaseUnits:
      totalSourceDebitBaseUnits,
    networkFeeLamports:
      input.networkFeeLamports ??
      null,
  };
}
