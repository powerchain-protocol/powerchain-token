export interface CrossChainSupplyObservation {
    version: "1.0.0";
    solanaLockedBaseUnits: bigint;
    suiWrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits: bigint;
    pendingSuiToSolanaBaseUnits: bigint;
    solanaSlot: bigint;
    suiCheckpoint: bigint;
    observedAt: string;
}
export interface CrossChainSupplyEvidence {
    valid: boolean;
    effectiveWrappedExposureBaseUnits: bigint;
    backingSurplusBaseUnits: bigint;
    sha256: string;
    errors: string[];
}
export declare function verifyCrossChainSupply(observation: CrossChainSupplyObservation): CrossChainSupplyEvidence;
//# sourceMappingURL=sui-bridge-integrity.d.ts.map