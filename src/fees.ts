import {
  PWRC_BPS_DENOMINATOR,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_TOKENS,
  PWRC_TRANSFER_FEE_BPS,
} from "./constants.js";

export {
  PWRC_BPS_DENOMINATOR,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_TOKENS,
  PWRC_TRANSFER_FEE_BPS,
};

export interface PwrcTransferFeeQuote {
  grossBaseUnits: bigint;
  feeBaseUnits: bigint;
  netBaseUnits: bigint;
  basisPoints: 250;
  percentage: "2.5%";
  maximumFeeBaseUnits: bigint;
}

export function calculateToken2022TransferFeeBaseUnits(amount: bigint): bigint {
  if (amount <= 0n) throw new Error("PWRC_AMOUNT_MUST_BE_POSITIVE");
  const roundedUp =
    (amount * PWRC_TRANSFER_FEE_BPS + PWRC_BPS_DENOMINATOR - 1n) /
    PWRC_BPS_DENOMINATOR;
  return roundedUp > PWRC_MAX_TRANSFER_FEE_BASE_UNITS
    ? PWRC_MAX_TRANSFER_FEE_BASE_UNITS
    : roundedUp;
}

export function quoteToken2022TransferFee(amount: bigint): PwrcTransferFeeQuote {
  const feeBaseUnits = calculateToken2022TransferFeeBaseUnits(amount);
  if (feeBaseUnits > amount) throw new Error("PWRC_TRANSFER_FEE_EXCEEDS_AMOUNT");
  return {
    grossBaseUnits: amount,
    feeBaseUnits,
    netBaseUnits: amount - feeBaseUnits,
    basisPoints: 250,
    percentage: "2.5%",
    maximumFeeBaseUnits: PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  };
}

/** No second custom protocol-router fee is charged. */
export function calculateProtocolFeeBaseUnits(amount: bigint): 0n {
  if (amount <= 0n) throw new Error("PWRC_AMOUNT_MUST_BE_POSITIVE");
  return 0n;
}
