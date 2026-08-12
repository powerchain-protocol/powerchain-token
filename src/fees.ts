export const PWRC_PROTOCOL_FEE_BPS = 0n;
export const PWRC_BPS_DENOMINATOR = 10_000n;
export interface PwrcFeeQuote {
  grossBaseUnits: bigint;
  feeBaseUnits: 0n;
  netBaseUnits: bigint;
  basisPoints: 0;
  percentage: "0%";
}
export function calculateProtocolFeeBaseUnits(amount: bigint): 0n {
  if (amount <= 0n) throw new Error("PWRC_AMOUNT_MUST_BE_POSITIVE");
  return 0n;
}
export function quoteProtocolFee(amount: bigint): PwrcFeeQuote {
  if (amount <= 0n) throw new Error("PWRC_AMOUNT_MUST_BE_POSITIVE");
  return { grossBaseUnits: amount, feeBaseUnits: 0n, netBaseUnits: amount, basisPoints: 0, percentage: "0%" };
}
export const splitProtocolFee = quoteProtocolFee;
