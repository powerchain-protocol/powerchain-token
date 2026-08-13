export interface QuarterlyBurnReconciliationInput {
    expectedPostBurnSupplyBaseUnits: bigint;
    observedSolanaSupplyBaseUnits: bigint;
    observedSuiCanonicalCeilingBaseUnits: bigint;
    observedSuiWrappedSupplyBaseUnits: bigint;
    observedSolanaLockedBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits: bigint;
    pendingSuiToSolanaBaseUnits: bigint;
}
export declare function reconcileQuarterlyBurn(input: QuarterlyBurnReconciliationInput): void;
//# sourceMappingURL=reconcile.d.ts.map