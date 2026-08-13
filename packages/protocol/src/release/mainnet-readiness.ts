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

export function evaluateMainnetReleaseEvidence(
  evidence: MainnetReleaseEvidence,
): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];

  const booleanChecks: Record<string, boolean> = {
    lockfilePresent: evidence.lockfilePresent,
    sourceProvenancePresent: evidence.sourceProvenancePresent,
    canonicalMintVerified: evidence.canonicalMintVerified,
    canonicalMintIsToken2022: evidence.canonicalMintIsToken2022,
    canonicalMintAuthorityRevoked: evidence.canonicalMintAuthorityRevoked,
    canonicalFreezeAuthorityNull: evidence.canonicalFreezeAuthorityNull,
    transferFeeConfigVerified: evidence.transferFeeConfigVerified,
    solanaBridgeProgramVerified: evidence.solanaBridgeProgramVerified,
    solanaBridgeVaultVerified: evidence.solanaBridgeVaultVerified,
    suiPackageVerified: evidence.suiPackageVerified,
    suiBridgeControllerVerified: evidence.suiBridgeControllerVerified,
    suiCurrencyVerified: evidence.suiCurrencyVerified,
    suiGenesisSupplyZero: evidence.suiGenesisSupplyZero,
    suiMintPolicyBridgeOnly: evidence.suiMintPolicyBridgeOnly,
    operatorIsGovernanceControlled: evidence.operatorIsGovernanceControlled,
    governorIsGovernanceControlled: evidence.governorIsGovernanceControlled,
    operatorDistinctFromGovernor: evidence.operatorDistinctFromGovernor,
    systemProgramNotUsedAsDeployment: evidence.systemProgramNotUsedAsDeployment,
  };

  for (const [name, ok] of Object.entries(booleanChecks)) {
    if (!ok) blockers.push(name);
  }
  if (evidence.canonicalMintDecimals !== 9) blockers.push("canonicalMintDecimals");
  if (evidence.suiDecimals !== 6) blockers.push("suiDecimals");

  return { ready: blockers.length === 0, blockers };
}
