export type BurnJournalStage = "PLANNED" | "PRECHECKED" | "SOLANA_SIMULATED" | "SOLANA_SUBMITTED" | "SOLANA_FINALIZED" | "SUI_BRIDGE_PAUSED" | "SUI_CEILING_SUBMITTED" | "SUI_CEILING_FINALIZED" | "RECONCILED" | "COMPLETED" | "BLOCKED";
export interface BurnJournalEntry {
    version: "1.0.0";
    burnId: string;
    quarterId: string;
    stage: BurnJournalStage;
    timestamp: string;
    detailsSha256: string;
    previousEntrySha256: string | null;
}
export declare function hashBurnJournalEntry(entry: BurnJournalEntry): string;
export declare function verifyBurnJournalChain(entries: readonly (BurnJournalEntry & {
    sha256: string;
})[]): void;
//# sourceMappingURL=journal.d.ts.map