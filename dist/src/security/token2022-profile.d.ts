export declare const REQUIRED_TOKEN_2022_EXTENSIONS: readonly ["TransferFeeConfig", "MetadataPointer", "TokenMetadata"];
export declare const FORBIDDEN_TOKEN_2022_EXTENSIONS: readonly ["PermanentDelegate", "MintCloseAuthority", "DefaultAccountState", "InterestBearingConfig", "ScaledUiAmount", "Pausable", "NonTransferable"];
export interface CanonicalPwrcToken2022ProfileInput {
    enabledExtensions: readonly string[];
    transferFeeBasisPoints?: number;
    maximumTransferFeeBaseUnits?: bigint;
}
export declare function validateCanonicalPwrcToken2022Profile(input: CanonicalPwrcToken2022ProfileInput): void;
//# sourceMappingURL=token2022-profile.d.ts.map