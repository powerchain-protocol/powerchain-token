import {
  PWRC_READ_RETRY_POLICY,
  retryDelayMs,
  shouldRetryHttpStatus,
  type RetryPolicy,
} from "../../src/observability/retry.js";

export async function withReadRetry<T>(
  operation: () => Promise<T>,
  options: {
    policy?: RetryPolicy;
    classifyError?: (error: unknown) => number | undefined;
    sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<T> {
  const policy = options.policy ?? PWRC_READ_RETRY_POLICY;
  const sleep =
    options.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = options.classifyError?.(error);
      const retryable =
        status !== undefined
          ? shouldRetryHttpStatus(status, policy)
          : attempt < policy.maxAttempts;

      if (!retryable || attempt >= policy.maxAttempts) throw error;
      await sleep(retryDelayMs(attempt, policy));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("PWRC_READ_RETRY_EXHAUSTED");
}
