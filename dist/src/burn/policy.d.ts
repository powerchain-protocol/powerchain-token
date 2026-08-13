export declare const PWRC_QUARTERLY_BURN_BPS = 200n;
export declare const BPS_DENOMINATOR = 10000n;
export interface QuarterlyBurnQuote {
    currentCanonicalSupplyBaseUnits: bigint;
    targetBurnBaseUnits: bigint;
    postBurnCanonicalSupplyBaseUnits: bigint;
}
export declare function quoteQuarterlyBurnFromLiveSupply(currentCanonicalSupplyBaseUnits: bigint): QuarterlyBurnQuote;
export declare function assertBurnSourceCanFundTarget(input: {
    targetBurnBaseUnits: bigint;
    controlledSourceBalanceBaseUnits: bigint;
}): void;
export declare function effectiveWrappedExposure(input: {
    suiWrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits: bigint;
    pendingSuiToSolanaBaseUnits: bigint;
}): bigint;
export declare function assertQuarterlyBurnCrossChainSafe(input: {
    postBurnCanonicalSupplyBaseUnits: bigint;
    solanaLockedBaseUnits: bigint;
    suiWrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits: bigint;
    pendingSuiToSolanaBaseUnits: bigint;
}): void;
//# sourceMappingURL=policy.d.ts.map