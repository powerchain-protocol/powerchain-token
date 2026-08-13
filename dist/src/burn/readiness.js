import { assertContiguousQuarter, assertQuarterAtOrAfterBurnStart, } from "./quarter-id.js";
export function evaluateQuarterlyBurnReadiness(input) {
    const blockers = [];
    try {
        assertQuarterAtOrAfterBurnStart(input.currentQuarterId);
        assertContiguousQuarter(input.previousQuarterId, input.currentQuarterId);
    }
    catch (error) {
        blockers.push(error instanceof Error ? error.message : "quarter policy invalid");
    }
    if (!input.canonicalMint)
        blockers.push("canonical mint missing");
    if (!input.burnSourceTokenAccount)
        blockers.push("burn source token account missing");
    if (!input.burnAuthority)
        blockers.push("burn authority missing");
    if (!input.burnAuthorityIsMultisig)
        blockers.push("burn authority is not multisig/threshold controlled");
    if (input.targetBurnBaseUnits <= 0n)
        blockers.push("target burn invalid");
    if (input.controlledSourceBalanceBaseUnits < input.targetBurnBaseUnits) {
        blockers.push("controlled burn source cannot fund full 2% target");
    }
    if (input.independentSolanaObservers < 2)
        blockers.push("fewer than two independent Solana observers");
    if (!input.solanaSupplyConsensus)
        blockers.push("Solana supply observers disagree");
    if (!input.suiBridgePaused)
        blockers.push("Sui bridge is not paused");
    if (input.suiCanonicalCeilingBaseUnits !== input.canonicalLiveSupplyBaseUnits) {
        blockers.push("Sui canonical ceiling is stale before burn");
    }
    if (!input.priorQuarterEvidenceVerified)
        blockers.push("prior-quarter evidence not verified");
    if (input.currentQuarterAlreadyExecuted)
        blockers.push("current quarter already executed");
    return {
        ready: blockers.length === 0,
        blockers,
    };
}
//# sourceMappingURL=readiness.js.map