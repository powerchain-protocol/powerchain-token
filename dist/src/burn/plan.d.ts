export interface QuarterlyBurnPlanInput {
    burnId: string;
    quarterId: bigint;
    canonicalMint: string;
    controlledSourceTokenAccount: string;
    burnAuthority: string;
    currentCanonicalSupplyBaseUnits: bigint;
    controlledSourceBalanceBaseUnits: bigint;
    solanaLockedBaseUnits: bigint;
    suiWrappedSupplyBaseUnits: bigint;
    pendingSolanaToSuiBaseUnits: bigint;
    pendingSuiToSolanaBaseUnits: bigint;
    solanaSlot: bigint;
    suiCheckpoint: bigint;
}
export declare function buildQuarterlyBurnPlan(input: QuarterlyBurnPlanInput): {
    sha256: string;
    version: "1.0.0";
    burnId: string;
    quarterId: string;
    canonicalMint: string;
    controlledSourceTokenAccount: string;
    burnAuthority: string;
    targetBurnBaseUnits: string;
    preBurnCanonicalSupplyBaseUnits: string;
    postBurnCanonicalSupplyBaseUnits: string;
    solanaLockedBaseUnits: string;
    suiWrappedSupplyBaseUnits: string;
    pendingSolanaToSuiBaseUnits: string;
    pendingSuiToSolanaBaseUnits: string;
    solanaSlot: string;
    suiCheckpoint: string;
};
//# sourceMappingURL=plan.d.ts.map