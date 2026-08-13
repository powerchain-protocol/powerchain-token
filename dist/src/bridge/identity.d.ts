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
export declare function assertBridgeIdentityBundle(identity: BridgeIdentityBundle): void;
//# sourceMappingURL=identity.d.ts.map