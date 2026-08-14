export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryable?: (error: unknown) => boolean;
}

export async function retryRead<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = options.attempts ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const maxDelayMs = options.maxDelayMs ?? 4_000;
  const retryable = options.retryable ?? (() => true);

  if (!Number.isSafeInteger(attempts) || attempts < 1) {
    throw new Error("PWRC_RETRY_ATTEMPTS_INVALID");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts - 1 || !retryable(error)) {
        throw error;
      }

      const delay = Math.min(
        maxDelayMs,
        baseDelayMs * 2 ** attempt,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Monetary writes are deliberately not retried here. A write that times out
 * must be reconciled by transaction signature / operation ID first.
 */
export async function submitWriteOnce<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return await operation();
}
