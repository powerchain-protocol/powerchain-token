export function assertHex32(value, code = "POWERCHAIN_HEX32_INVALID") {
    const normalized = value.trim().toLowerCase();
    if (!/^(?:0x)?[a-f0-9]{64}$/.test(normalized))
        throw new Error(code);
    return normalized.startsWith("0x") ? normalized : `0x${normalized}`;
}
export function assertNonEmpty(value, code = "POWERCHAIN_VALUE_REQUIRED") {
    const normalized = value.trim();
    if (!normalized)
        throw new Error(code);
    return normalized;
}
//# sourceMappingURL=validation.js.map