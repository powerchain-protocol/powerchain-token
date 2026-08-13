export const SUI_NETWORKS = {
    testnet: {
        rpcUrl: "https://fullnode.testnet.sui.io:443",
        production: false,
    },
    mainnet: {
        rpcUrl: "https://fullnode.mainnet.sui.io:443",
        production: true,
    },
    devnet: {
        rpcUrl: "https://fullnode.devnet.sui.io:443",
        production: false,
    },
    local: {
        rpcUrl: "http://127.0.0.1:9000",
        production: false,
    },
};
export const DEFAULT_SUI_NETWORK = "testnet";
export const PRODUCTION_SUI_NETWORK = "mainnet";
export function getSuiRpcUrl(network) {
    return SUI_NETWORKS[network].rpcUrl;
}
export function assertSuiNetworkForMainnet(network) {
    if (network !== PRODUCTION_SUI_NETWORK) {
        throw new Error("POWERCHAIN_SUI_MAINNET_NETWORK_REQUIRED");
    }
}
//# sourceMappingURL=sui-networks.js.map