export interface WpwrcDeployment {
  version: "1.0.0";

  solana: {
    network: "mainnet-beta";
    pwrcMint: string;
    decimals: 9;
    fixedSupply: "18446000000";
  };

  sui: {
    network: "mainnet";
    packageId: string;
    coinType: string;
    metadataObjectId: string;
    treasuryCapOrBridgeCapability: string;
    bridgeStateObjectId: string;
  };

  bridge: {
    genesisWrappedSupply: "0";
    ratio: "1:1";
  };
}

export function assertWpwrcDeployment(
  deployment: WpwrcDeployment,
): void {
  if (deployment.version !== "1.0.0") {
    throw new Error("WPWRC_DEPLOYMENT_VERSION_INVALID");
  }
  if (deployment.solana.network !== "mainnet-beta") {
    throw new Error("WPWRC_CANONICAL_NETWORK_INVALID");
  }
  if (deployment.solana.decimals !== 9) {
    throw new Error("WPWRC_CANONICAL_DECIMALS_INVALID");
  }
  if (deployment.solana.fixedSupply !== "18446000000") {
    throw new Error("WPWRC_CANONICAL_SUPPLY_INVALID");
  }
  if (deployment.bridge.genesisWrappedSupply !== "0") {
    throw new Error("WPWRC_GENESIS_WRAPPED_SUPPLY_INVALID");
  }
  if (deployment.bridge.ratio !== "1:1") {
    throw new Error("WPWRC_BRIDGE_RATIO_INVALID");
  }

  if (
    deployment.sui.packageId ===
    "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1"
  ) {
    throw new Error(
      "WPWRC_ALIAS_ADDRESS_MUST_NOT_BE_ASSUMED_PACKAGE_ID",
    );
  }
}
