export interface RetryDecision {
    retry: boolean;
    deadLetter: boolean;
    nextAttempt: number;
}
export declare function decideRelayerRetry(input: {
    currentAttempt: number;
    maxAttempts?: number;
    writeMayHaveLanded: boolean;
    idempotencyConfirmed: boolean;
}): RetryDecision;
//# sourceMappingURL=retry.d.ts.map