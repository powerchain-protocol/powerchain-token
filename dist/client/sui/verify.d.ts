import type { ClientWithCoreApi } from "@mysten/sui/client";
export interface WpwrcOnchainIdentity {
    packageId: string;
    coinType: string;
    bridgeControllerId: string;
    currencyObjectId: string;
}
export interface WpwrcDeploymentEvidence {
    version: "1.0.0";
    network: "testnet" | "mainnet";
    identity: WpwrcOnchainIdentity;
    controllerObjectType: string | null;
    currencyObjectType: string | null;
    metadata: {
        name: string;
        symbol: string;
        decimals: 9;
    };
    observedAt: string;
    sha256: string;
}
export declare function verifyWpwrcDeployment(client: ClientWithCoreApi, input: {
    network: "testnet" | "mainnet";
    identity: WpwrcOnchainIdentity;
}): Promise<WpwrcDeploymentEvidence>;
//# sourceMappingURL=verify.d.ts.map