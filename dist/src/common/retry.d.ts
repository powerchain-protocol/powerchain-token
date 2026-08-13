export interface RetryPolicy {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
}
export declare const MAX_READ_RETRY_ATTEMPTS: 10;
export declare const MAX_READ_RETRY_DELAY_MS: 60000;
export declare const DEFAULT_READ_RETRY_POLICY: RetryPolicy;
export declare function assertRetryPolicy(policy: RetryPolicy): void;
export declare function retryDelayMs(attempt: number, policy: RetryPolicy): number;
export declare function sleep(ms: number, signal?: AbortSignal): Promise<void>;
export declare function withReadRetry<T>(operation: (attempt: number) => Promise<T>, options?: {
    policy?: RetryPolicy;
    signal?: AbortSignal;
    shouldRetry?: (error: unknown) => boolean;
}): Promise<T>;
//# sourceMappingURL=retry.d.ts.map