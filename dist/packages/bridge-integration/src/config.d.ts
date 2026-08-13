export interface ProductionBridgeConfig {
    version: "1.0.0";
    solana: {
        network: "mainnet-beta";
        rpcUrl: string;
        canonicalMint: string;
        bridgeProgramId: string;
        bridgeVault: string;
    };
    sui: {
        network: "mainnet";
        rpcUrl: string;
        packageId: string;
        coinType: string;
        bridgeControllerId: string;
    };
    policy: {
        canonicalDecimals: 9;
        wrappedDecimals: 9;
        ratio: "1:1";
        genesisWrappedSupply: "0";
    };
}
export declare function assertProductionBridgeConfig(config: ProductionBridgeConfig): void;
//# sourceMappingURL=config.d.ts.map