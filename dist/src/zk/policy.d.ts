export type PwrcPrivacyMode = "disabled" | "confidential-transfer-experimental";
export interface PwrcZkPolicy {
    mode: PwrcPrivacyMode;
    enabledOnCanonicalMint: false;
    requireAuditorKeyForRegulatedFlows: boolean;
    requireClientSideProofGeneration: boolean;
    forbidServerPrivateKeyCustody: true;
}
export declare const PWRC_ZK_POLICY: PwrcZkPolicy;
/**
 * The canonical PWRC mint does not enable ConfidentialTransfer by default.
 * Enabling a new Token-2022 extension changes the mint profile and must go
 * through a new devnet qualification and explicit governance review.
 */
export declare function assertCanonicalPwrcZkMode(mode: PwrcPrivacyMode): void;
//# sourceMappingURL=policy.d.ts.map