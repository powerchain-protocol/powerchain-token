export const PWRC_DECIMALS = 9;
export const WPWRC_DECIMALS = 9;
export const PWRC_SCALE = 1000000000n;
export const WPWRC_SCALE = 1000000000n;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export const PWRC_MAX_BASE_UNITS = 18446000000000000000n;
export const WPWRC_MAX_BASE_UNITS = PWRC_MAX_BASE_UNITS;
export function canonicalToWrappedExact(canonicalBaseUnits) {
    if (canonicalBaseUnits < 0n) {
        throw new Error("PWRC_CANONICAL_AMOUNT_NEGATIVE");
    }
    if (canonicalBaseUnits > PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_AMOUNT_EXCEEDS_MAX");
    }
    return canonicalBaseUnits;
}
export function wrappedToCanonical(wrappedBaseUnits) {
    if (wrappedBaseUnits < 0n) {
        throw new Error("WPWRC_AMOUNT_NEGATIVE");
    }
    if (wrappedBaseUnits > WPWRC_MAX_BASE_UNITS) {
        throw new Error("WPWRC_AMOUNT_EXCEEDS_MAX");
    }
    return wrappedBaseUnits;
}
//# sourceMappingURL=token-units.js.map