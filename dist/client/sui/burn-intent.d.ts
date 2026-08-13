import { Transaction } from "@mysten/sui/transactions";
export interface WpwrcBurnIntentDeployment {
    packageId: string;
    bridgeControllerId: string;
}
export declare function buildPauseWpwrcBridgeTransaction(input: {
    deployment: WpwrcBurnIntentDeployment;
    paused: boolean;
}): Transaction;
/**
 * Builds a governance burn-intent transaction.
 *
 * The Move package must expose `stage_canonical_burn_intent`.
 * This transaction is submitted and finalized before the
 * canonical Solana BurnChecked transaction is allowed to run.
 */
export declare function buildStageCanonicalBurnIntentTransaction(input: {
    deployment: WpwrcBurnIntentDeployment;
    quarterId: bigint;
    expectedPostBurnWrappedCeilingBaseUnits: bigint;
    planSha256: Uint8Array;
}): Transaction;
export declare function buildCancelCanonicalBurnIntentTransaction(input: {
    deployment: WpwrcBurnIntentDeployment;
}): Transaction;
export declare function buildLowerCanonicalSupplyCeilingTransaction(input: {
    deployment: WpwrcBurnIntentDeployment;
    quarterId: bigint;
    newCeilingBaseUnits: bigint;
    canonicalBurnEvidenceSha256: Uint8Array;
}): Transaction;
//# sourceMappingURL=burn-intent.d.ts.map