import { PWRC_MAX_BASE_UNITS } from "../constants.js";
export const PWRC_DECIMALS = 9;
export const PWRC_MIN_TRANSACTION_BASE_UNITS = 1n;
export const PWRC_MARKET_POLICY_VERSION = "1.0.0";
export const PWRC_TRADEABILITY_POLICY = {
    version: PWRC_MARKET_POLICY_VERSION,
    freelyTransferable: true,
    nonTransferableExtension: false,
    defaultFrozen: false,
    transferHookRequired: false,
    allowlistRequired: false,
    zeroAmountTransactions: false,
};
export function assertNonZeroPwrcAmount(amountBaseUnits, context = "TRANSACTION") {
    if (amountBaseUnits <= 0n) {
        throw new Error(`PWRC_ZERO_OR_NEGATIVE_${context}`);
    }
    if (amountBaseUnits > PWRC_MAX_BASE_UNITS) {
        throw new Error(`PWRC_AMOUNT_EXCEEDS_MAX_${context}`);
    }
}
export function uiToBaseUnits(uiAmount) {
    if (!/^\d+(?:\.\d{1,9})?$/.test(uiAmount)) {
        throw new Error("PWRC_UI_AMOUNT_INVALID");
    }
    const [whole, fraction = ""] = uiAmount.split(".");
    const padded = `${whole}${fraction.padEnd(PWRC_DECIMALS, "0")}`;
    const value = BigInt(padded);
    assertNonZeroPwrcAmount(value, "AMOUNT");
    return value;
}
export function baseUnitsToUi(amountBaseUnits) {
    if (amountBaseUnits < 0n)
        throw new Error("PWRC_AMOUNT_NEGATIVE");
    const raw = amountBaseUnits.toString().padStart(PWRC_DECIMALS + 1, "0");
    const whole = raw.slice(0, -PWRC_DECIMALS);
    const fraction = raw.slice(-PWRC_DECIMALS).replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : whole;
}
//# sourceMappingURL=policy.js.map