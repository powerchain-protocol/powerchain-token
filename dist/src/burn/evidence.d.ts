export interface FinalizedQuarterlyBurnEvidence {
    version: "1.0.0";
    burnId: string;
    planSha256: string;
    solanaTransactionSignature: string;
    finalizedSlot: string;
    preBurnCanonicalSupplyBaseUnits: string;
    burnedBaseUnits: string;
    postBurnCanonicalSupplyBaseUnits: string;
    suiCanonicalSupplyCeilingBaseUnits: string;
    suiCeilingUpdateTransactionDigest: string;
    suiCheckpoint: string;
    observedAt: string;
}
export declare function finalizedQuarterlyBurnEvidenceSha256(evidence: FinalizedQuarterlyBurnEvidence): string;
//# sourceMappingURL=evidence.d.ts.map