const SUI_ID = /^0x[a-f0-9]{64}$/i;
export function assertWpwrcDeployment(deployment) {
    if (deployment.version !== "1.0.0") {
        throw new Error("WPWRC_DEPLOYMENT_VERSION_INVALID");
    }
    if (deployment.solana.network !==
        "mainnet-beta") {
        throw new Error("WPWRC_CANONICAL_NETWORK_INVALID");
    }
    if (deployment.solana.pwrcMint !==
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") {
        throw new Error("WPWRC_CANONICAL_MINT_INVALID");
    }
    if (deployment.solana.decimals !== 9 ||
        deployment.solana.fixedSupply !==
            "18446000000") {
        throw new Error("WPWRC_CANONICAL_POLICY_INVALID");
    }
    if (deployment.solana
        .transferFeeBasisPoints !== 250 ||
        deployment.solana
            .maximumTransferFeeTokens !==
            "1000000") {
        throw new Error("WPWRC_TRANSFER_FEE_POLICY_INVALID");
    }
    if (deployment.bridge
        .genesisWrappedSupply !== "0" ||
        deployment.bridge.ratio !== "1:1" ||
        deployment.bridge
            .solanaToSuiAmount !==
            "net-after-transfer-fee") {
        throw new Error("WPWRC_BRIDGE_POLICY_INVALID");
    }
    for (const value of [
        deployment.sui.packageId,
        deployment.sui.metadataObjectId,
        deployment.sui
            .treasuryCapOrBridgeCapability,
        deployment.sui.bridgeStateObjectId,
    ]) {
        if (!SUI_ID.test(value)) {
            throw new Error("WPWRC_SUI_DEPLOYMENT_ID_INVALID");
        }
    }
    if (!deployment.sui.coinType.startsWith(`${deployment.sui.packageId}::`)) {
        throw new Error("WPWRC_COIN_TYPE_PACKAGE_MISMATCH");
    }
}
//# sourceMappingURL=deployment.js.map