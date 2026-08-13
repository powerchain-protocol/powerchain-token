import {
  withReadRetry,
  type RetryPolicy,
} from "../common/retry.js";
import { withTimeout } from "../common/timeout.js";

interface RpcReadOptions {
  timeoutMs?: number;
  retryPolicy?: RetryPolicy;
  signal?: AbortSignal;
  shouldRetry?: (error: unknown) => boolean;
}

interface ReadRetryOptions {
  policy?: RetryPolicy;
  signal?: AbortSignal;
  shouldRetry?: (error: unknown) => boolean;
}

export async function handleRpcRead<T>(
  read: (
    signal: AbortSignal,
    attempt: number,
  ) => Promise<T>,
  options: RpcReadOptions = {},
): Promise<T> {
  const retryOptions: ReadRetryOptions = {};

  if (options.retryPolicy !== undefined) {
    retryOptions.policy = options.retryPolicy;
  }
  if (options.signal !== undefined) {
    retryOptions.signal = options.signal;
  }
  if (options.shouldRetry !== undefined) {
    retryOptions.shouldRetry = options.shouldRetry;
  }

  return withReadRetry(
    (attempt) =>
      withTimeout(
        (signal) => read(signal, attempt),
        options.timeoutMs ?? 10_000,
        options.signal,
      ),
    retryOptions,
  );
}
