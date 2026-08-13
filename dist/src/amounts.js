import { PWRC_MAX_BASE_UNITS, PWRC_SCALE } from "./constants.js";
export function toBaseUnits(wholeTokens) {
    const raw = wholeTokens * PWRC_SCALE;
    if (raw < 0n || raw > PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_AMOUNT_OUT_OF_RANGE");
    }
    return raw;
}
export function formatBaseUnits(raw) {
    if (raw < 0n)
        throw new Error("PWRC_NEGATIVE_AMOUNT");
    const whole = raw / PWRC_SCALE;
    const fractional = (raw % PWRC_SCALE).toString().padStart(9, "0");
    return `${whole}.${fractional}`;
}
//# sourceMappingURL=amounts.js.map