import { type RetryPolicy } from "../../src/observability/retry.js";
export declare function withReadRetry<T>(operation: () => Promise<T>, options?: {
    policy?: RetryPolicy;
    classifyError?: (error: unknown) => number | undefined;
    sleep?: (ms: number) => Promise<void>;
}): Promise<T>;
//# sourceMappingURL=read-retry.d.ts.map