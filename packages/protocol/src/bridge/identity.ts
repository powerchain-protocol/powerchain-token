const SOLANA_SYSTEM_PROGRAM =
  "11111111111111111111111111111111";

export interface BridgeIdentityBundle {
  version: "1.0.0";
  network: "testnet" | "mainnet";
  canonicalMint: string;
  solanaBridgeProgramId: string;
  solanaVault: string;
  suiPackageId: string;
  suiBridgeControllerId: string;
  suiCurrencyObjectId: string;
  suiCoinType: string;
  canonicalDecimals: 9;
  wrappedDecimals: 9;
}

export function assertBridgeIdentityBundle(
  identity: BridgeIdentityBundle,
): void {
  if (identity.version !== "1.0.0") {
    throw new Error("POWERCHAIN_BRIDGE_IDENTITY_VERSION_INVALID");
  }

  for (const [name, value] of Object.entries({
    canonicalMint: identity.canonicalMint,
    solanaBridgeProgramId: identity.solanaBridgeProgramId,
    solanaVault: identity.solanaVault,
  })) {
    if (!value.trim()) {
      throw new Error(`POWERCHAIN_BRIDGE_${name.toUpperCase()}_REQUIRED`);
    }
  }

  if (
    identity.solanaBridgeProgramId ===
    SOLANA_SYSTEM_PROGRAM
  ) {
    throw new Error("PWRC_SYSTEM_PROGRAM_IS_NOT_DEPLOYMENT");
  }

  for (const value of [
    identity.suiPackageId,
    identity.suiBridgeControllerId,
    identity.suiCurrencyObjectId,
  ]) {
    if (!/^0x[a-f0-9]{64}$/i.test(value)) {
      throw new Error("POWERCHAIN_BRIDGE_SUI_OBJECT_INVALID");
    }
  }

  if (
    !identity.suiCoinType.startsWith(
      `${identity.suiPackageId}::`,
    )
  ) {
    throw new Error("POWERCHAIN_BRIDGE_COIN_TYPE_PACKAGE_MISMATCH");
  }

  if (identity.canonicalDecimals !== 9) {
    throw new Error("POWERCHAIN_BRIDGE_CANONICAL_DECIMALS_INVALID");
  }
  if (identity.wrappedDecimals !== 9) {
    throw new Error("POWERCHAIN_BRIDGE_WRAPPED_DECIMALS_INVALID");
  }
}
