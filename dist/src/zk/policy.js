export const PWRC_ZK_POLICY = {
    mode: "disabled",
    enabledOnCanonicalMint: false,
    requireAuditorKeyForRegulatedFlows: true,
    requireClientSideProofGeneration: true,
    forbidServerPrivateKeyCustody: true,
};
/**
 * The canonical PWRC mint does not enable ConfidentialTransfer by default.
 * Enabling a new Token-2022 extension changes the mint profile and must go
 * through a new devnet qualification and explicit governance review.
 */
export function assertCanonicalPwrcZkMode(mode) {
    if (mode !== "disabled") {
        throw new Error("PWRC_CANONICAL_CONFIDENTIAL_TRANSFER_NOT_ENABLED");
    }
}
//# sourceMappingURL=policy.js.map