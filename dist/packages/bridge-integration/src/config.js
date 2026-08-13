export function assertProductionBridgeConfig(config) {
    if (config.version !== "1.0.0")
        throw new Error("PWRC_INTEGRATION_VERSION_INVALID");
    if (config.solana.network !== "mainnet-beta" || config.sui.network !== "mainnet")
        throw new Error("PWRC_INTEGRATION_NETWORK_INVALID");
    if (!config.solana.rpcUrl.startsWith("https://") || !config.sui.rpcUrl.startsWith("https://"))
        throw new Error("PWRC_INTEGRATION_HTTPS_RPC_REQUIRED");
    if (config.policy.canonicalDecimals !== 9 || config.policy.wrappedDecimals !== 9 || config.policy.ratio !== "1:1" || config.policy.genesisWrappedSupply !== "0")
        throw new Error("PWRC_INTEGRATION_POLICY_INVALID");
}
//# sourceMappingURL=config.js.map