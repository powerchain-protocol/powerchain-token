const SYSTEM_PROGRAM =
  "11111111111111111111111111111111";

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

export function mainnetIdentityBlockers(
  evidence: MainnetIdentityEvidence,
): string[] {
  const blockers: string[] = [];

  for (const [name, value] of Object.entries({
    canonicalMint:
      evidence.canonicalMint,
    bridgeProgramId:
      evidence.bridgeProgramId,
    bridgeVault:
      evidence.bridgeVault,
    suiPackageId:
      evidence.suiPackageId,
    suiBridgeControllerId:
      evidence.suiBridgeControllerId,
    suiCoinType:
      evidence.suiCoinType,
  })) {
    if (!value.trim()) {
      blockers.push(name);
    }
  }

  if (
    evidence.canonicalMint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
  ) {
    blockers.push(
      "canonicalMint:mismatch",
    );
  }

  if (
    evidence.bridgeProgramId ===
    SYSTEM_PROGRAM
  ) {
    blockers.push(
      "bridgeProgramId:SystemProgram",
    );
  }

  for (const [name, value] of Object.entries({
    solanaDeploymentVerified:
      evidence.solanaDeploymentVerified,
    suiDeploymentVerified:
      evidence.suiDeploymentVerified,
    canonicalMintVerified:
      evidence.canonicalMintVerified,
    mintAuthorityRevoked:
      evidence.mintAuthorityRevoked,
    freezeAuthorityNull:
      evidence.freezeAuthorityNull,
    transferFeeConfigVerified:
      evidence.transferFeeConfigVerified,
    transferFeeConfigAuthorityVerified:
      evidence
        .transferFeeConfigAuthorityVerified,
    withdrawWithheldAuthorityVerified:
      evidence
        .withdrawWithheldAuthorityVerified,
    wrappedGenesisSupplyZero:
      evidence.wrappedGenesisSupplyZero,
    operatorGovernorSeparated:
      evidence.operatorGovernorSeparated,
  })) {
    if (!value) {
      blockers.push(name);
    }
  }

  return blockers;
}
