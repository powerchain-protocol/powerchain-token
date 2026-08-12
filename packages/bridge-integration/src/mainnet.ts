const SYSTEM_PROGRAM="11111111111111111111111111111111";
export interface MainnetIdentityEvidence { canonicalMint:string; bridgeProgramId:string; bridgeVault:string; suiPackageId:string; suiBridgeControllerId:string; suiCoinType:string; solanaDeploymentVerified:boolean; suiDeploymentVerified:boolean; canonicalMintVerified:boolean; mintAuthorityRevoked:boolean; freezeAuthorityNull:boolean; transferFeeConfigAbsent:boolean; wrappedGenesisSupplyZero:boolean; operatorGovernorSeparated:boolean; }
export function mainnetIdentityBlockers(e: MainnetIdentityEvidence): string[] {
  const blockers:string[]=[];
  for (const [name,value] of Object.entries({canonicalMint:e.canonicalMint,bridgeProgramId:e.bridgeProgramId,bridgeVault:e.bridgeVault,suiPackageId:e.suiPackageId,suiBridgeControllerId:e.suiBridgeControllerId,suiCoinType:e.suiCoinType})) if (!value.trim()) blockers.push(name);
  if (e.bridgeProgramId===SYSTEM_PROGRAM) blockers.push("bridgeProgramId:SystemProgram");
  for (const [name,value] of Object.entries({solanaDeploymentVerified:e.solanaDeploymentVerified,suiDeploymentVerified:e.suiDeploymentVerified,canonicalMintVerified:e.canonicalMintVerified,mintAuthorityRevoked:e.mintAuthorityRevoked,freezeAuthorityNull:e.freezeAuthorityNull,transferFeeConfigAbsent:e.transferFeeConfigAbsent,wrappedGenesisSupplyZero:e.wrappedGenesisSupplyZero,operatorGovernorSeparated:e.operatorGovernorSeparated})) if (!value) blockers.push(name);
  return blockers;
}
