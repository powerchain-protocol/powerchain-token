export function evaluateProductionReadiness(input) {
    return [
        {
            id: "canonical-mint",
            state: input.canonicalMint ? "READY" : "BLOCKED",
            reason: input.canonicalMint
                ? "Canonical PWRC mint configured"
                : "Canonical PWRC mint is not verified/configured",
        },
        {
            id: "mainnet-rpc",
            state: input.mainnetRpcUrl?.startsWith("https://") ? "READY" : "BLOCKED",
            reason: input.mainnetRpcUrl?.startsWith("https://")
                ? "HTTPS mainnet RPC configured"
                : "Production mainnet RPC is missing or non-HTTPS",
        },
        {
            id: "pyth",
            state: input.pythFeedId ? "READY" : "OPTIONAL",
            reason: input.pythFeedId
                ? "PWRC Pyth feed configured"
                : "No PWRC Pyth feed configured; market layer must use another verified source",
        },
        {
            id: "birdeye",
            state: input.birdeyeConfigured ? "READY" : "OPTIONAL",
            reason: input.birdeyeConfigured
                ? "Birdeye API configured"
                : "Birdeye market data not configured",
        },
        {
            id: "wpwrc-bridge",
            state: input.bridgePackageId && input.bridgeCoinType ? "READY" : "OPTIONAL",
            reason: input.bridgePackageId && input.bridgeCoinType
                ? "wPWRC bridge identity configured"
                : "wPWRC bridge remains unconfigured/not deployed",
        },
        {
            id: "cctp",
            state: input.cctpMessageTransmitter && input.cctpTokenMessengerMinter
                ? "READY"
                : "OPTIONAL",
            reason: input.cctpMessageTransmitter && input.cctpTokenMessengerMinter
                ? "CCTP production program identities configured"
                : "CCTP production identities not configured",
        },
    ];
}
export function assertCoreProductionReady(checks) {
    const blocked = checks.filter((x) => x.state === "BLOCKED");
    if (blocked.length) {
        throw new Error(`PWRC_PRODUCTION_NOT_READY:${blocked.map((x) => x.id).join(",")}`);
    }
}
//# sourceMappingURL=readiness.js.map