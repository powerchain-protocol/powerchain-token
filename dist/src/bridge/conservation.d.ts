export interface BridgeConservationInput {
    canonicalLiveSupplyBaseUnits: bigint;
    lockedCanonicalBaseUnits: bigint;
    wrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits?: bigint;
    pendingSuiToSolanaBaseUnits?: bigint;
}
export declare function evaluateBridgeConservation(input: BridgeConservationInput): {
    valid: boolean;
    effectiveWrappedExposureBaseUnits: bigint;
    backingSurplusBaseUnits: bigint;
    errors: string[];
};
//# sourceMappingURL=conservation.d.ts.map