export interface MainnetReleaseEvidence {
    version: "1.0.0";
    lockfilePresent: boolean;
    sourceProvenancePresent: boolean;
    canonicalMintVerified: boolean;
    canonicalMintIsToken2022: boolean;
    canonicalMintDecimals: 9;
    canonicalMintAuthorityRevoked: boolean;
    canonicalFreezeAuthorityNull: boolean;
    transferFeeConfigVerified: boolean;
    solanaBridgeProgramVerified: boolean;
    solanaBridgeVaultVerified: boolean;
    suiPackageVerified: boolean;
    suiBridgeControllerVerified: boolean;
    suiCurrencyVerified: boolean;
    suiDecimals: 6;
    suiGenesisSupplyZero: boolean;
    suiMintPolicyBridgeOnly: boolean;
    operatorIsGovernanceControlled: boolean;
    governorIsGovernanceControlled: boolean;
    operatorDistinctFromGovernor: boolean;
    systemProgramNotUsedAsDeployment: boolean;
}
export declare function evaluateMainnetReleaseEvidence(evidence: MainnetReleaseEvidence): {
    ready: boolean;
    blockers: string[];
};
//# sourceMappingURL=mainnet-readiness.d.ts.map