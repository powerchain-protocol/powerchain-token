export interface SolanaToSuiBridgeIntent {
    canonicalAmountBaseUnits: bigint;
    recipientSuiAddress: string;
}
export interface SuiToSolanaBridgeIntent {
    wrappedAmountBaseUnits: bigint;
    recipientSolanaAddress: string;
}
export declare function createSolanaToSuiBridgeIntent(input: SolanaToSuiBridgeIntent): {
    direction: "solana-to-sui";
    canonicalGrossAmountBaseUnits: bigint;
    transferFeeBaseUnits: bigint;
    canonicalLockedBaseUnits: bigint;
    wrappedAmountBaseUnits: bigint;
    recipientSuiAddress: string;
    backingRatio: "1:1-net-locked";
};
export declare function createSuiToSolanaBridgeIntent(input: SuiToSolanaBridgeIntent): {
    direction: "sui-to-solana";
    wrappedAmountBaseUnits: bigint;
    canonicalGrossReleaseBaseUnits: bigint;
    transferFeeBaseUnits: bigint;
    expectedRecipientNetBaseUnits: bigint;
    recipientSolanaAddress: string;
    backingRatio: "1:1-gross-release";
};
//# sourceMappingURL=index.d.ts.map