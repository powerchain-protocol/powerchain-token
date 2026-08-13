export declare const SUI_NETWORKS: {
    readonly testnet: {
        readonly rpcUrl: "https://fullnode.testnet.sui.io:443";
        readonly production: false;
    };
    readonly mainnet: {
        readonly rpcUrl: "https://fullnode.mainnet.sui.io:443";
        readonly production: true;
    };
    readonly devnet: {
        readonly rpcUrl: "https://fullnode.devnet.sui.io:443";
        readonly production: false;
    };
    readonly local: {
        readonly rpcUrl: "http://127.0.0.1:9000";
        readonly production: false;
    };
};
export type PowerChainSuiNetwork = keyof typeof SUI_NETWORKS;
export declare const DEFAULT_SUI_NETWORK: "testnet";
export declare const PRODUCTION_SUI_NETWORK: "mainnet";
export declare function getSuiRpcUrl(network: PowerChainSuiNetwork): string;
export declare function assertSuiNetworkForMainnet(network: PowerChainSuiNetwork): void;
//# sourceMappingURL=sui-networks.d.ts.map