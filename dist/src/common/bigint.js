export const U64_MAX = 18446744073709551615n;
export function assertU64(value, code = "POWERCHAIN_U64_OUT_OF_RANGE") {
    if (value < 0n || value > U64_MAX) {
        throw new Error(code);
    }
    return value;
}
export function assertPositiveU64(value, code = "POWERCHAIN_AMOUNT_INVALID") {
    assertU64(value, code);
    if (value === 0n)
        throw new Error(code);
    return value;
}
export function bigintMin(a, b) {
    return a < b ? a : b;
}
export function bigintMax(a, b) {
    return a > b ? a : b;
}
//# sourceMappingURL=bigint.js.map