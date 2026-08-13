export interface ConservationSnapshot {
    observedAt: string;
    solanaSlot: bigint;
    suiCheckpoint: bigint;
    canonicalLiveSupplyBaseUnits: bigint;
    lockedCanonicalBaseUnits: bigint;
    suiWrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiCanonicalBaseUnits: bigint;
    pendingSuiToSolanaCanonicalBaseUnits: bigint;
}
export declare function evaluateConservationSnapshot(input: ConservationSnapshot): {
    healthy: boolean;
    effectiveWrappedExposureBaseUnits: bigint;
    effectiveWrappedExposureCanonicalBaseUnits: bigint;
    errors: string[];
};
//# sourceMappingURL=watcher.d.ts.map