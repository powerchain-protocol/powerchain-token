export interface SuiBurnReleaseEvidence {
    version: "1.0.0";
    network: "testnet" | "mainnet";
    packageId: string;
    bridgeControllerId: string;
    coinType: string;
    burnTransactionDigest: string;
    checkpoint: string;
    burnReferenceHex: string;
    amountWrappedBaseUnits: string;
    destinationSolanaAddress: string;
    observedAt: string;
}
export declare function hashSuiBurnReleaseEvidence(evidence: SuiBurnReleaseEvidence): string;
//# sourceMappingURL=release-evidence.d.ts.map