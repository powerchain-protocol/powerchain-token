export function readPositiveInteger(value, fallback, options) {
    const min = options?.min ?? 1;
    const max = options?.max ?? Number.MAX_SAFE_INTEGER;
    if (value === undefined || value.trim() === "")
        return fallback;
    if (!/^[0-9]+$/.test(value.trim()))
        throw new Error("POWERCHAIN_CONFIG_INTEGER_INVALID");
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
        throw new Error("POWERCHAIN_CONFIG_INTEGER_OUT_OF_RANGE");
    }
    return parsed;
}
export function readBoolean(value, fallback) {
    if (value === undefined || value.trim() === "")
        return fallback;
    const normalized = value.trim().toLowerCase();
    if (normalized === "true")
        return true;
    if (normalized === "false")
        return false;
    throw new Error("POWERCHAIN_CONFIG_BOOLEAN_INVALID");
}
export function readEnum(value, allowed, fallback) {
    const normalized = value?.trim() || fallback;
    if (!allowed.includes(normalized))
        throw new Error("POWERCHAIN_CONFIG_ENUM_INVALID");
    return normalized;
}
export function readOptionalString(value) {
    const normalized = value?.trim();
    return normalized || undefined;
}
//# sourceMappingURL=config.js.map