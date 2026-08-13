export interface BurnUnpauseEvidence {
    version: "1.0.0";
    quarterId: string;
    solanaFinalized: boolean;
    canonicalSupplyMatchesPlan: boolean;
    suiCeilingFinalized: boolean;
    suiCeilingMatchesCanonicalSupply: boolean;
    bridgeConservationValid: boolean;
    pendingBurnIntentCleared: boolean;
    executionRecordState: "RECONCILED" | "COMPLETED";
}
export declare function assertBurnSafeToUnpause(evidence: BurnUnpauseEvidence): void;
//# sourceMappingURL=unpause.d.ts.map