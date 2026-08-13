export function assertBridgeDeploymentManifest(manifest) {
    if (manifest.version !== "1.0.0") {
        throw new Error("PWRC_BRIDGE_MANIFEST_VERSION_INVALID");
    }
    if (manifest.canonicalMint !==
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") {
        throw new Error("PWRC_BRIDGE_CANONICAL_MINT_INVALID");
    }
    if (manifest.canonicalDecimals !== 9 ||
        manifest.wrappedDecimals !== 9) {
        throw new Error("PWRC_BRIDGE_MANIFEST_DECIMALS_INVALID");
    }
    if (manifest.baseUnitFactor !== "1") {
        throw new Error("PWRC_BRIDGE_MANIFEST_FACTOR_INVALID");
    }
    if (manifest.transferFeeBasisPoints !==
        250 ||
        manifest.maximumTransferFeeTokens !==
            "1000000") {
        throw new Error("PWRC_BRIDGE_TRANSFER_FEE_POLICY_INVALID");
    }
    if (manifest.wrappedGenesisSupplyBaseUnits !==
        "0") {
        throw new Error("PWRC_BRIDGE_MANIFEST_GENESIS_INVALID");
    }
    if (manifest.wrappedMintPolicy !==
        "bridge-only") {
        throw new Error("PWRC_BRIDGE_MANIFEST_MINT_POLICY_INVALID");
    }
    for (const value of [
        manifest.suiPackageId,
        manifest.suiBridgeControllerId,
        manifest.suiCurrencyObjectId,
    ]) {
        if (!/^0x[a-f0-9]{64}$/i.test(value)) {
            throw new Error("PWRC_BRIDGE_MANIFEST_SUI_OBJECT_INVALID");
        }
    }
    if (!manifest.suiCoinType.startsWith(`${manifest.suiPackageId}::`)) {
        throw new Error("PWRC_BRIDGE_MANIFEST_COIN_TYPE_MISMATCH");
    }
    if (manifest.solanaBridgeProgramId ===
        "11111111111111111111111111111111") {
        throw new Error("PWRC_SYSTEM_PROGRAM_IS_NOT_DEPLOYMENT");
    }
}
//# sourceMappingURL=manifest.js.map