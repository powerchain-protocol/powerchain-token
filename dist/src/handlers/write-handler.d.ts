export interface WriteExecution<T> {
    signature: string;
    result: T;
}
export type WriteReconciliationState = "finalized" | "failed" | "unknown";
export interface ChainWriteHandlerInput<T> {
    simulate: () => Promise<void>;
    submit: () => Promise<WriteExecution<T>>;
    reconcile: (signature: string, signal?: AbortSignal) => Promise<WriteReconciliationState>;
    reconciliationTimeoutMs?: number;
    signatureFromError?: (error: unknown) => string | undefined;
    recoverFinalizedResult?: (signature: string) => Promise<T>;
}
export declare function handleChainWrite<T>(input: ChainWriteHandlerInput<T>): Promise<WriteExecution<T>>;
//# sourceMappingURL=write-handler.d.ts.map