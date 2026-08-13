export function invariant(condition, code) {
    if (!condition)
        throw new Error(code);
}
export function assertPositiveBigInt(value, code = "POWERCHAIN_AMOUNT_MUST_BE_POSITIVE") {
    if (value <= 0n)
        throw new Error(code);
}
export function assertNonEmptyString(value, code = "POWERCHAIN_STRING_REQUIRED") {
    const normalized = value.trim();
    if (!normalized)
        throw new Error(code);
    return normalized;
}
export function assertExactBytes(value, length, code = "POWERCHAIN_BYTES_LENGTH_INVALID") {
    if (value.length !== length)
        throw new Error(code);
    return value;
}
//# sourceMappingURL=common.js.map