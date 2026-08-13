export interface BridgeDeploymentEvidence {
    version: "1.0.0";
    network: "testnet" | "mainnet";
    sourceCommitSha256: string;
    sourceProgramId: string;
    sourceVault: string;
    suiPackageId: string;
    suiBridgeControllerId: string;
    suiCurrencyObjectId: string;
    suiCoinType: string;
    canonicalDecimals: 9;
    wrappedDecimals: 9;
    canonicalBaseUnitsPerWrappedBaseUnit: "1";
    canonicalMint: string;
    operator: string;
    governor: string;
    generatedAt: string;
}
export declare function assertBridgeDeploymentEvidence(evidence: BridgeDeploymentEvidence): void;
export declare function bridgeDeploymentEvidenceSha256(evidence: BridgeDeploymentEvidence): string;
//# sourceMappingURL=deployment-evidence.d.ts.map