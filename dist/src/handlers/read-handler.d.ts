import { type RetryPolicy } from "../common/retry.js";
interface RpcReadOptions {
    timeoutMs?: number;
    retryPolicy?: RetryPolicy;
    signal?: AbortSignal;
    shouldRetry?: (error: unknown) => boolean;
}
export declare function handleRpcRead<T>(read: (signal: AbortSignal, attempt: number) => Promise<T>, options?: RpcReadOptions): Promise<T>;
export {};
//# sourceMappingURL=read-handler.d.ts.map