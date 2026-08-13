export type BurnRecordState = "INTENT_STAGED" | "SOLANA_SUBMITTED" | "SOLANA_FINALIZED" | "SUI_CEILING_FINALIZED" | "RECONCILED" | "COMPLETED" | "BLOCKED";
export interface QuarterlyBurnExecutionRecord {
    version: "1.0.0";
    burnId: string;
    quarterId: string;
    state: BurnRecordState;
    planSha256: string;
    intentSha256: string;
    preBurnCanonicalSupplyBaseUnits: string;
    targetBurnCanonicalBaseUnits: string;
    expectedPostBurnCanonicalSupplyBaseUnits: string;
    expectedPostBurnWrappedCeilingBaseUnits: string;
    solanaBurnSignature?: string;
    solanaFinalizedSlot?: string;
    suiIntentDigest: string;
    suiCeilingDigest?: string;
    suiCheckpoint?: string;
    reconciledAt?: string;
    completedAt?: string;
    previousRecordSha256?: string;
}
export declare function assertQuarterlyBurnExecutionRecord(record: QuarterlyBurnExecutionRecord): void;
export declare function quarterlyBurnExecutionRecordSha256(record: QuarterlyBurnExecutionRecord): string;
//# sourceMappingURL=record.d.ts.map