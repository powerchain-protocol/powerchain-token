import { PWRC_BPS_DENOMINATOR, PWRC_MAX_TRANSFER_FEE_BASE_UNITS, PWRC_MAX_TRANSFER_FEE_TOKENS, PWRC_TRANSFER_FEE_BPS } from "./constants.js";
export { PWRC_BPS_DENOMINATOR, PWRC_MAX_TRANSFER_FEE_BASE_UNITS, PWRC_MAX_TRANSFER_FEE_TOKENS, PWRC_TRANSFER_FEE_BPS, };
export interface PwrcTransferFeeQuote {
    grossBaseUnits: bigint;
    feeBaseUnits: bigint;
    netBaseUnits: bigint;
    basisPoints: 250;
    percentage: "2.5%";
    maximumFeeBaseUnits: bigint;
}
export declare function calculateToken2022TransferFeeBaseUnits(amount: bigint): bigint;
export declare function quoteToken2022TransferFee(amount: bigint): PwrcTransferFeeQuote;
/** No second custom protocol-router fee is charged. */
export declare function calculateProtocolFeeBaseUnits(amount: bigint): 0n;
//# sourceMappingURL=fees.d.ts.map