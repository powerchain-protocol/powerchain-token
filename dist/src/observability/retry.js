export const PWRC_READ_RETRY_POLICY = {
    maxAttempts: 3,
    baseDelayMs: 250,
    maxDelayMs: 2_000,
    retryableStatusCodes: [408, 425, 429, 500, 502, 503, 504],
};
export function retryDelayMs(attempt, policy = PWRC_READ_RETRY_POLICY) {
    if (!Number.isInteger(attempt) || attempt < 1) {
        throw new Error("RETRY_ATTEMPT_INVALID");
    }
    return Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** (attempt - 1));
}
export function shouldRetryHttpStatus(status, policy = PWRC_READ_RETRY_POLICY) {
    return policy.retryableStatusCodes.includes(status);
}
//# sourceMappingURL=retry.js.map