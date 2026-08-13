export const EXTERNAL_PROVIDERS_ARE_AUTHORITATIVE = false;
export function assertMutationAuthorizationIsInternal(input) {
    if (input.providerKind) {
        throw new Error(`PWRC_EXTERNAL_PROVIDER_NON_AUTHORITATIVE:${input.providerKind}`);
    }
    if (!input.signerOrGovernanceProof?.trim()) {
        throw new Error("PWRC_INTERNAL_AUTHORIZATION_PROOF_REQUIRED");
    }
}
//# sourceMappingURL=external-inputs.js.map