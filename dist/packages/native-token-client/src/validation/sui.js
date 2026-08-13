import { isValidSuiAddress, normalizeSuiAddress, } from "@mysten/sui/utils";
export function assertSuiAddress(value) {
    const normalized = normalizeSuiAddress(value);
    if (!isValidSuiAddress(normalized)) {
        throw new Error("SUI_ADDRESS_INVALID");
    }
    return normalized;
}
export function assertSuiObjectId(value) {
    return assertSuiAddress(value);
}
export function assertSuiCoinType(value) {
    const parts = value.split("::");
    if (parts.length !== 3) {
        throw new Error("SUI_COIN_TYPE_INVALID");
    }
    const [packageId, moduleName, structName] = parts;
    assertSuiAddress(packageId);
    if (!moduleName || !structName) {
        throw new Error("SUI_COIN_TYPE_INVALID");
    }
    return value;
}
//# sourceMappingURL=sui.js.map