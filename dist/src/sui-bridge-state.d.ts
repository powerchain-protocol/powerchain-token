export type SuiBridgeDeploymentState = "NOT_DEPLOYED" | "PUBLISHED" | "REGISTERED" | "IDENTITY_VERIFIED" | "CONSERVATION_VERIFIED" | "ACTIVE" | "PAUSED" | "BLOCKED";
export interface SuiBridgeDeploymentRecord {
    version: "1.0.0";
    network: "testnet" | "mainnet";
    state: SuiBridgeDeploymentState;
    packageId?: string;
    coinType?: string;
    currencyObjectId?: string;
    bridgeControllerId?: string;
    operator?: string;
    governor?: string;
    publishDigest?: string;
    registrationDigest?: string;
    lastVerifiedAt?: string;
}
export declare function assertStateTransition(from: SuiBridgeDeploymentState, to: SuiBridgeDeploymentState): void;
export declare function assertActivationReady(record: SuiBridgeDeploymentRecord): void;
//# sourceMappingURL=sui-bridge-state.d.ts.map