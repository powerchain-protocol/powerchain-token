import { createHash } from "node:crypto";
function normalize(value) {
    if (typeof value === "bigint")
        return value.toString();
    if (Array.isArray(value)) {
        return value.map(normalize);
    }
    if (value && typeof value === "object") {
        const input = value;
        const output = {};
        for (const key of Object.keys(input).sort()) {
            const normalized = normalize(input[key]);
            if (normalized !== undefined) {
                output[key] = normalized;
            }
        }
        return output;
    }
    if (typeof value === "number" &&
        !Number.isFinite(value)) {
        throw new Error("POWERCHAIN_NON_FINITE_NUMBER_FORBIDDEN");
    }
    return value;
}
export function canonicalJsonStringify(value) {
    return JSON.stringify(normalize(value));
}
export function sha256CanonicalJson(value) {
    return createHash("sha256")
        .update(canonicalJsonStringify(value))
        .digest("hex");
}
//# sourceMappingURL=serialization.js.map