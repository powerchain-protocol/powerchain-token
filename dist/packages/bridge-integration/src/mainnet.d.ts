export interface MainnetIdentityEvidence {
    canonicalMint: string;
    bridgeProgramId: string;
    bridgeVault: string;
    suiPackageId: string;
    suiBridgeControllerId: string;
    suiCoinType: string;
    solanaDeploymentVerified: boolean;
    suiDeploymentVerified: boolean;
    canonicalMintVerified: boolean;
    mintAuthorityRevoked: boolean;
    freezeAuthorityNull: boolean;
    transferFeeConfigVerified: boolean;
    transferFeeConfigAuthorityVerified: boolean;
    withdrawWithheldAuthorityVerified: boolean;
    wrappedGenesisSupplyZero: boolean;
    operatorGovernorSeparated: boolean;
}
export declare function mainnetIdentityBlockers(evidence: MainnetIdentityEvidence): string[];
//# sourceMappingURL=mainnet.d.ts.map