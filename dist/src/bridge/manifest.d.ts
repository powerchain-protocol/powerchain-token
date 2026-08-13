export interface BridgeDeploymentManifest {
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
    baseUnitFactor: "1";
    transferFeeBasisPoints: 250;
    maximumTransferFeeTokens: "1000000";
    wrappedGenesisSupplyBaseUnits: "0";
    wrappedMintPolicy: "bridge-only";
}
export declare function assertBridgeDeploymentManifest(manifest: BridgeDeploymentManifest): void;
//# sourceMappingURL=manifest.d.ts.map