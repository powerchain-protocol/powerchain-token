export interface BridgeReconciliationInput {
    lockedCanonicalBaseUnits: bigint;
    suiWrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits: bigint;
    pendingSuiToSolanaBaseUnits: bigint;
}
export declare function reconcileBridgeBacking(input: BridgeReconciliationInput): {
    valid: boolean;
    effectiveWrappedExposureBaseUnits: bigint;
    surplusBackingBaseUnits: bigint;
    errors: string[];
};
//# sourceMappingURL=reconcile.d.ts.map