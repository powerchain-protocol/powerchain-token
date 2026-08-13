import { PWRC_MAX_TRANSFER_FEE_BASE_UNITS, PWRC_TRANSFER_FEE_BPS, } from "./constants.js";
const BPS_DENOMINATOR = 10000n;
export function calculateTransferFeeBaseUnits(amountBaseUnits) {
    if (amountBaseUnits <= 0n) {
        throw new Error("PWRC_TRANSFER_AMOUNT_MUST_BE_POSITIVE");
    }
    const rawFee = (amountBaseUnits *
        BigInt(PWRC_TRANSFER_FEE_BPS) +
        BPS_DENOMINATOR -
        1n) /
        BPS_DENOMINATOR;
    return rawFee >
        PWRC_MAX_TRANSFER_FEE_BASE_UNITS
        ? PWRC_MAX_TRANSFER_FEE_BASE_UNITS
        : rawFee;
}
export function calculateNetAfterTransferFeeBaseUnits(amountBaseUnits) {
    const fee = calculateTransferFeeBaseUnits(amountBaseUnits);
    if (fee > amountBaseUnits) {
        throw new Error("PWRC_TRANSFER_FEE_EXCEEDS_AMOUNT");
    }
    return amountBaseUnits - fee;
}
//# sourceMappingURL=fees.js.map