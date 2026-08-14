import {
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_SERVICE_FEE_BPS_DEFAULT,
  PWRC_TRANSFER_FEE_BPS,
} from "./constants.js";

export const BPS_DENOMINATOR = 10_000n;

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
  principalGrossBaseUnits: bigint;
  nativeTransferFeeBaseUnits: bigint;
  principalNetBaseUnits: bigint;
  serviceFeeEnabled: boolean;
  serviceFeeBasisPoints: bigint;
  serviceFeeNetBaseUnits: bigint;
  serviceFeeGrossTransferBaseUnits: bigint;
  serviceFeeTransferNativeFeeBaseUnits: bigint;
  serviceFeeRecipient: string | null;
  totalNativeTokenFeesBaseUnits: bigint;
  totalWalletPwrcDebitBaseUnits: bigint;
  networkFeeLamports: bigint | null;
}

const SERVICE_OPERATIONS = new Set<FeeOperation>([
  "bridge-solana-to-sui",
  "bridge-sui-to-solana",
]);

export function ceilDiv(a: bigint, b: bigint): bigint {
  if (a < 0n || b <= 0n) throw new Error("PWRC_DIVISION_INVALID");
  return (a + b - 1n) / b;
}

export function nativePwrcTransferFee(gross: bigint): bigint {
  if (gross <= 0n) throw new Error("PWRC_GROSS_AMOUNT_INVALID");
  const fee = ceilDiv(gross * PWRC_TRANSFER_FEE_BPS, BPS_DENOMINATOR);
  return fee > PWRC_MAX_TRANSFER_FEE_BASE_UNITS
    ? PWRC_MAX_TRANSFER_FEE_BASE_UNITS
    : fee;
}

export function grossUpPwrcForNet(net: bigint): {
  grossBaseUnits: bigint;
  nativeFeeBaseUnits: bigint;
  netBaseUnits: bigint;
} {
  if (net < 0n) throw new Error("PWRC_NET_AMOUNT_INVALID");
  if (net === 0n) {
    return { grossBaseUnits: 0n, nativeFeeBaseUnits: 0n, netBaseUnits: 0n };
  }
  let low = net;
  let high = net + PWRC_MAX_TRANSFER_FEE_BASE_UNITS + 1n;
  while (low < high) {
    const middle = (low + high) / 2n;
    const fee = nativePwrcTransferFee(middle);
    if (middle - fee >= net) high = middle;
    else low = middle + 1n;
  }
  const nativeFeeBaseUnits = nativePwrcTransferFee(low);
  return {
    grossBaseUnits: low,
    nativeFeeBaseUnits,
    netBaseUnits: low - nativeFeeBaseUnits,
  };
}

export function quoteFees(input: {
  operation: FeeOperation;
  principalGrossBaseUnits: bigint;
  serviceFee: ServiceFeePolicy;
  networkFeeLamports?: bigint;
}): FeeQuote {
  if (input.principalGrossBaseUnits <= 0n) {
    throw new Error("PWRC_PRINCIPAL_INVALID");
  }

  const nativeTransferFeeBaseUnits =
    nativePwrcTransferFee(input.principalGrossBaseUnits);
  const principalNetBaseUnits =
    input.principalGrossBaseUnits - nativeTransferFeeBaseUnits;

  const allowed = SERVICE_OPERATIONS.has(input.operation);
  const serviceFeeEnabled = allowed && input.serviceFee.enabled;
  const serviceFeeBasisPoints = serviceFeeEnabled
    ? input.serviceFee.basisPoints ?? PWRC_SERVICE_FEE_BPS_DEFAULT
    : 0n;

  if (serviceFeeBasisPoints < 0n || serviceFeeBasisPoints > BPS_DENOMINATOR) {
    throw new Error("PWRC_SERVICE_FEE_BPS_INVALID");
  }
  if (serviceFeeEnabled && !input.serviceFee.recipient?.trim()) {
    throw new Error("PWRC_SERVICE_FEE_RECIPIENT_REQUIRED");
  }

  const serviceFeeNetBaseUnits = serviceFeeEnabled
    ? ceilDiv(
        input.principalGrossBaseUnits * serviceFeeBasisPoints,
        BPS_DENOMINATOR,
      )
    : 0n;

  const serviceTransfer = grossUpPwrcForNet(serviceFeeNetBaseUnits);

  return {
    version: "1.0.0",
    operation: input.operation,
    principalGrossBaseUnits: input.principalGrossBaseUnits,
    nativeTransferFeeBaseUnits,
    principalNetBaseUnits,
    serviceFeeEnabled,
    serviceFeeBasisPoints,
    serviceFeeNetBaseUnits,
    serviceFeeGrossTransferBaseUnits: serviceTransfer.grossBaseUnits,
    serviceFeeTransferNativeFeeBaseUnits: serviceTransfer.nativeFeeBaseUnits,
    serviceFeeRecipient: serviceFeeEnabled
      ? input.serviceFee.recipient ?? null
      : null,
    totalNativeTokenFeesBaseUnits:
      nativeTransferFeeBaseUnits + serviceTransfer.nativeFeeBaseUnits,
    totalWalletPwrcDebitBaseUnits:
      input.principalGrossBaseUnits + serviceTransfer.grossBaseUnits,
    networkFeeLamports: input.networkFeeLamports ?? null,
  };
}
