export type ExternalProviderKind = "rpc" | "oracle" | "market-data" | "dex";
export declare const EXTERNAL_PROVIDERS_ARE_AUTHORITATIVE: false;
export declare function assertMutationAuthorizationIsInternal(input: {
    providerKind?: ExternalProviderKind;
    signerOrGovernanceProof: string | null;
}): void;
//# sourceMappingURL=external-inputs.d.ts.map