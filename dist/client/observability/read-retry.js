import { PWRC_READ_RETRY_POLICY, retryDelayMs, shouldRetryHttpStatus, } from "../../src/observability/retry.js";
export async function withReadRetry(operation, options = {}) {
    const policy = options.policy ?? PWRC_READ_RETRY_POLICY;
    const sleep = options.sleep ??
        ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    let lastError;
    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            const status = options.classifyError?.(error);
            const retryable = status !== undefined
                ? shouldRetryHttpStatus(status, policy)
                : attempt < policy.maxAttempts;
            if (!retryable || attempt >= policy.maxAttempts)
                throw error;
            await sleep(retryDelayMs(attempt, policy));
        }
    }
    throw lastError instanceof Error
        ? lastError
        : new Error("PWRC_READ_RETRY_EXHAUSTED");
}
//# sourceMappingURL=read-retry.js.map