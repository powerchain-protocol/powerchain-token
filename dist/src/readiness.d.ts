export type ReadinessState = "READY" | "BLOCKED" | "OPTIONAL";
export interface ReadinessCheck {
    id: string;
    state: ReadinessState;
    reason: string;
}
export interface ProductionReadinessInput {
    canonicalMint?: string | null;
    mainnetRpcUrl?: string | null;
    pythFeedId?: string | null;
    birdeyeConfigured: boolean;
    bridgePackageId?: string | null;
    bridgeCoinType?: string | null;
    cctpMessageTransmitter?: string | null;
    cctpTokenMessengerMinter?: string | null;
}
export declare function evaluateProductionReadiness(input: ProductionReadinessInput): ReadinessCheck[];
export declare function assertCoreProductionReady(checks: readonly ReadinessCheck[]): void;
//# sourceMappingURL=readiness.d.ts.map