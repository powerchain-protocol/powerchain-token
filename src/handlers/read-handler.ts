import { withReadRetry, type RetryPolicy } from "../common/retry.js";
import { withTimeout } from "../common/timeout.js";

export async function handleRpcRead<T>(
  read: (signal: AbortSignal, attempt: number) => Promise<T>,
  options: {
    timeoutMs?: number;
    retryPolicy?: RetryPolicy;
    signal?: AbortSignal;
    shouldRetry?: (error: unknown) => boolean;
  } = {},
): Promise<T> {
  return withReadRetry(
    (attempt) =>
      withTimeout(
        (signal) => read(signal, attempt),
        options.timeoutMs ?? 10_000,
        options.signal,
      ),
    {
      policy: options.retryPolicy,
      signal: options.signal,
      shouldRetry: options.shouldRetry,
    },
  );
}
