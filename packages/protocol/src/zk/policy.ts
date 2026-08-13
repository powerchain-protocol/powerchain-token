export type PwrcPrivacyMode =
  | "disabled"
  | "confidential-transfer-experimental";

export interface PwrcZkPolicy {
  mode: PwrcPrivacyMode;
  enabledOnCanonicalMint: false;
  requireAuditorKeyForRegulatedFlows: boolean;
  requireClientSideProofGeneration: boolean;
  forbidServerPrivateKeyCustody: true;
}

export const PWRC_ZK_POLICY: PwrcZkPolicy = {
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
export function assertCanonicalPwrcZkMode(mode: PwrcPrivacyMode): void {
  if (mode !== "disabled") {
    throw new Error("PWRC_CANONICAL_CONFIDENTIAL_TRANSFER_NOT_ENABLED");
  }
}
