export declare const POWERCHAIN_RUNTIME_VERSION: "1.0.0";
export interface PowerChainRuntimePolicy {
    rpcTimeoutMs: number;
    readMaxAttempts: number;
    readBaseDelayMs: number;
    readMaxDelayMs: number;
    confirmationTimeoutMs: number;
    blindWriteRetries: false;
    finality: "finalized";
    preflightCommitment: "confirmed";
}
export declare const DEFAULT_RUNTIME_POLICY: PowerChainRuntimePolicy;
export declare function assertRuntimePolicy(policy: PowerChainRuntimePolicy): void;
//# sourceMappingURL=runtime.d.ts.map