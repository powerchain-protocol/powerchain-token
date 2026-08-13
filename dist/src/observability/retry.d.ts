export interface RetryPolicy {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableStatusCodes: readonly number[];
}
export declare const PWRC_READ_RETRY_POLICY: RetryPolicy;
export declare function retryDelayMs(attempt: number, policy?: RetryPolicy): number;
export declare function shouldRetryHttpStatus(status: number, policy?: RetryPolicy): boolean;
//# sourceMappingURL=retry.d.ts.map