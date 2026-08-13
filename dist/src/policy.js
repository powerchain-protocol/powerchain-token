import { PWRC_DECIMALS, PWRC_MAX_BASE_UNITS, TOKEN_2022_PROGRAM_ID, } from "./constants.js";
export function verifyFinalizedMint(observed, canonicalMint) {
    const errors = [];
    if (observed.mint !== canonicalMint)
        errors.push("MINT_MISMATCH");
    if (observed.ownerProgram !== TOKEN_2022_PROGRAM_ID)
        errors.push("PROGRAM_MISMATCH");
    if (observed.decimals !== PWRC_DECIMALS)
        errors.push("DECIMALS_MISMATCH");
    if (observed.supplyBaseUnits > PWRC_MAX_BASE_UNITS)
        errors.push("SUPPLY_EXCEEDS_MAX");
    if (observed.mintAuthority !== null)
        errors.push("MINT_AUTHORITY_ACTIVE");
    if (observed.freezeAuthority !== null)
        errors.push("FREEZE_AUTHORITY_ACTIVE");
    return errors;
}
export function assertGenesisSupply(raw) {
    if (raw !== PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_GENESIS_SUPPLY_MISMATCH");
    }
}
//# sourceMappingURL=policy.js.map