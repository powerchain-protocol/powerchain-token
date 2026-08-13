import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";
export const POWERCHAIN_SUI_ALIAS = "powerchain";
export const POWERCHAIN_SUI_ADDRESS = "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1";
export function assertPowerChainSuiIdentity(input) {
    if (input.alias !== POWERCHAIN_SUI_ALIAS) {
        throw new Error("POWERCHAIN_SUI_ALIAS_MISMATCH");
    }
    const normalized = normalizeSuiAddress(input.address);
    if (!isValidSuiAddress(normalized)) {
        throw new Error("POWERCHAIN_SUI_ADDRESS_INVALID");
    }
    if (normalized !== POWERCHAIN_SUI_ADDRESS) {
        throw new Error("POWERCHAIN_SUI_ADDRESS_MISMATCH");
    }
}
//# sourceMappingURL=identity.js.map