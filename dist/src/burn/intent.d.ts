export interface QuarterlyBurnIntent {
    version: "1.0.0";
    quarterId: string;
    burnId: string;
    canonicalMint: string;
    preBurnCanonicalSupplyBaseUnits: string;
    targetBurnCanonicalBaseUnits: string;
    expectedPostBurnCanonicalSupplyBaseUnits: string;
    expectedPostBurnWrappedCeilingBaseUnits: string;
    solanaSlot: string;
    suiCheckpoint: string;
    planSha256: string;
    createdAt: string;
}
export declare function assertQuarterlyBurnIntent(intent: QuarterlyBurnIntent): void;
export declare function quarterlyBurnIntentSha256(intent: QuarterlyBurnIntent): string;
//# sourceMappingURL=intent.d.ts.map