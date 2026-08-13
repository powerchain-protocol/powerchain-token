import { PWRC_DECIMALS, PWRC_MAX_BASE_UNITS, PWRC_SCALE, } from "./constants.js";
const DECIMAL_RE = /^([0-9]+)(?:\.([0-9]+))?$/;
export function parsePwrcAmount(value) {
    const normalized = value.trim();
    const match = DECIMAL_RE.exec(normalized);
    if (!match) {
        throw new Error("PWRC_AMOUNT_INVALID");
    }
    const whole = BigInt(match[1]);
    const fractionText = match[2] ?? "";
    if (fractionText.length > PWRC_DECIMALS) {
        throw new Error("PWRC_AMOUNT_TOO_MANY_DECIMALS");
    }
    const fraction = BigInt(fractionText.padEnd(PWRC_DECIMALS, "0") || "0");
    const result = whole * PWRC_SCALE + fraction;
    if (result > PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_AMOUNT_EXCEEDS_MAX");
    }
    return result;
}
export function formatPwrcAmount(baseUnits, options) {
    if (baseUnits < 0n ||
        baseUnits > PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_AMOUNT_OUT_OF_RANGE");
    }
    const whole = baseUnits / PWRC_SCALE;
    let fraction = (baseUnits % PWRC_SCALE)
        .toString()
        .padStart(PWRC_DECIMALS, "0");
    if (options?.trimTrailingZeros) {
        fraction = fraction.replace(/0+$/, "");
    }
    return fraction
        ? `${whole}.${fraction}`
        : whole.toString();
}
export function assertPwrcBaseUnits(baseUnits) {
    if (baseUnits < 0n ||
        baseUnits > PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_BASE_UNITS_OUT_OF_RANGE");
    }
    return baseUnits;
}
//# sourceMappingURL=amounts.js.map