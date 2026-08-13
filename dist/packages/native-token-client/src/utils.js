export function bigintMin(a, b) {
    return a < b ? a : b;
}
export function bigintMax(a, b) {
    return a > b ? a : b;
}
export function assertUint64(value, code = "POWERCHAIN_U64_INVALID") {
    if (value < 0n ||
        value > 18446744073709551615n) {
        throw new Error(code);
    }
}
//# sourceMappingURL=utils.js.map