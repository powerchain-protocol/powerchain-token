export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_READ_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 4,
  baseDelayMs: 250,
  maxDelayMs: 4_000,
};

export function assertRetryPolicy(policy: RetryPolicy): void {
  if (
    !Number.isInteger(policy.maxAttempts) ||
    policy.maxAttempts < 1 ||
    !Number.isInteger(policy.baseDelayMs) ||
    policy.baseDelayMs < 0 ||
    !Number.isInteger(policy.maxDelayMs) ||
    policy.maxDelayMs < 0 ||
    policy.baseDelayMs > policy.maxDelayMs
  ) {
    throw new Error("POWERCHAIN_RETRY_POLICY_INVALID");
  }
}

export function retryDelayMs(attempt: number, policy: RetryPolicy): number {
  assertRetryPolicy(policy);
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new Error("POWERCHAIN_RETRY_ATTEMPT_INVALID");
  }

  const exponent = Math.min(attempt - 1, 30);
  const delay = policy.baseDelayMs * 2 ** exponent;
  return Math.min(delay, policy.maxDelayMs);
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(new Error("POWERCHAIN_SLEEP_MS_INVALID"));
  }
  if (signal?.aborted) {
    return Promise.reject(signal.reason ?? new Error("POWERCHAIN_ABORTED"));
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(signal?.reason ?? new Error("POWERCHAIN_ABORTED"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function withReadRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: {
    policy?: RetryPolicy;
    signal?: AbortSignal;
    shouldRetry?: (error: unknown) => boolean;
  } = {},
): Promise<T> {
  const policy = options.policy ?? DEFAULT_READ_RETRY_POLICY;
  assertRetryPolicy(policy);

  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new Error("POWERCHAIN_ABORTED");
    }

    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (
        attempt >= policy.maxAttempts ||
        options.shouldRetry?.(error) === false
      ) {
        throw error;
      }

      await sleep(retryDelayMs(attempt, policy), options.signal);
    }
  }

  throw lastError ?? new Error("POWERCHAIN_RETRY_EXHAUSTED");
}
