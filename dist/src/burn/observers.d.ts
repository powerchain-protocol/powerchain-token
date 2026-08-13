export interface SolanaSupplyObservation {
    observerId: string;
    rpcUrl: string;
    slot: bigint;
    supplyBaseUnits: bigint;
    observedAt: string;
}
export declare function assertSolanaSupplyObserverConsensus(input: {
    observations: readonly SolanaSupplyObservation[];
    minObservers?: number;
    maxSlotDistance?: bigint;
    maxAgeMs?: number;
    nowMs?: number;
}): {
    supplyBaseUnits: bigint;
    minSlot: bigint;
    maxSlot: bigint;
};
//# sourceMappingURL=observers.d.ts.map