export interface QuarterlyBurnReadinessInput {
    canonicalMint: string | null;
    burnSourceTokenAccount: string | null;
    burnAuthority: string | null;
    burnAuthorityIsMultisig: boolean;
    controlledSourceBalanceBaseUnits: bigint;
    targetBurnBaseUnits: bigint;
    independentSolanaObservers: number;
    solanaSupplyConsensus: boolean;
    suiBridgePaused: boolean;
    suiCanonicalCeilingBaseUnits: bigint;
    canonicalLiveSupplyBaseUnits: bigint;
    priorQuarterEvidenceVerified: boolean;
    currentQuarterAlreadyExecuted: boolean;
    currentQuarterId: bigint;
    previousQuarterId: bigint | null;
}
export interface QuarterlyBurnReadinessResult {
    ready: boolean;
    blockers: string[];
}
export declare function evaluateQuarterlyBurnReadiness(input: QuarterlyBurnReadinessInput): QuarterlyBurnReadinessResult;
//# sourceMappingURL=readiness.d.ts.map