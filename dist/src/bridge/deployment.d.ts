export interface WpwrcDeployment {
    version: "1.0.0";
    solana: {
        network: "mainnet-beta";
        pwrcMint: "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";
        decimals: 9;
        fixedSupply: "18446000000";
        transferFeeBasisPoints: 250;
        maximumTransferFeeTokens: "1000000";
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
        solanaToSuiAmount: "net-after-transfer-fee";
    };
}
export declare function assertWpwrcDeployment(deployment: WpwrcDeployment): void;
//# sourceMappingURL=deployment.d.ts.map