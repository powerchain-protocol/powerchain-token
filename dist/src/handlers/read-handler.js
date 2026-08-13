import { withReadRetry, } from "../common/retry.js";
import { withTimeout } from "../common/timeout.js";
export async function handleRpcRead(read, options = {}) {
    const retryOptions = {};
    if (options.retryPolicy !== undefined) {
        retryOptions.policy = options.retryPolicy;
    }
    if (options.signal !== undefined) {
        retryOptions.signal = options.signal;
    }
    if (options.shouldRetry !== undefined) {
        retryOptions.shouldRetry = options.shouldRetry;
    }
    return withReadRetry((attempt) => withTimeout((signal) => read(signal, attempt), options.timeoutMs ?? 10_000, options.signal), retryOptions);
}
//# sourceMappingURL=read-handler.js.map