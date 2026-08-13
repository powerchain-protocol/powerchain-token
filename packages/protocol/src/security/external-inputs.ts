export type ExternalProviderKind =
  | "rpc"
  | "oracle"
  | "market-data"
  | "dex";

export const EXTERNAL_PROVIDERS_ARE_AUTHORITATIVE = false as const;

export function assertMutationAuthorizationIsInternal(input: {
  providerKind?: ExternalProviderKind;
  signerOrGovernanceProof: string | null;
}): void {
  if (input.providerKind) {
    throw new Error(
      `PWRC_EXTERNAL_PROVIDER_NON_AUTHORITATIVE:${input.providerKind}`,
    );
  }
  if (!input.signerOrGovernanceProof?.trim()) {
    throw new Error("PWRC_INTERNAL_AUTHORIZATION_PROOF_REQUIRED");
  }
}
