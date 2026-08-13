export const REQUIRED_TOKEN_2022_EXTENSIONS = [
    "TransferFeeConfig",
    "MetadataPointer",
    "TokenMetadata",
];
export const FORBIDDEN_TOKEN_2022_EXTENSIONS = [
    "PermanentDelegate",
    "MintCloseAuthority",
    "DefaultAccountState",
    "InterestBearingConfig",
    "ScaledUiAmount",
    "Pausable",
    "NonTransferable",
];
export function validateCanonicalPwrcToken2022Profile(input) {
    const enabled = new Set(input.enabledExtensions);
    for (const required of REQUIRED_TOKEN_2022_EXTENSIONS) {
        if (!enabled.has(required)) {
            throw new Error(`PWRC_REQUIRED_EXTENSION_MISSING:${required}`);
        }
    }
    for (const forbidden of FORBIDDEN_TOKEN_2022_EXTENSIONS) {
        if (enabled.has(forbidden)) {
            throw new Error(`PWRC_FORBIDDEN_EXTENSION_ENABLED:${forbidden}`);
        }
    }
    if (input.transferFeeBasisPoints !==
        undefined &&
        input.transferFeeBasisPoints !== 250) {
        throw new Error("PWRC_TRANSFER_FEE_BPS_MISMATCH");
    }
    if (input.maximumTransferFeeBaseUnits !==
        undefined &&
        input.maximumTransferFeeBaseUnits !==
            1000000000000000n) {
        throw new Error("PWRC_TRANSFER_FEE_MAXIMUM_MISMATCH");
    }
}
//# sourceMappingURL=token2022-profile.js.map