export const POWERCHAIN_RUNTIME_VERSION = "1.0.0";
export const DEFAULT_RUNTIME_POLICY = {
    rpcTimeoutMs: 10_000,
    readMaxAttempts: 4,
    readBaseDelayMs: 250,
    readMaxDelayMs: 4_000,
    confirmationTimeoutMs: 60_000,
    blindWriteRetries: false,
    finality: "finalized",
    preflightCommitment: "confirmed",
};
export function assertRuntimePolicy(policy) {
    if (policy.blindWriteRetries !==
        false) {
        throw new Error("PWRC_BLIND_WRITE_RETRIES_FORBIDDEN");
    }
    if (policy.finality !==
        "finalized") {
        throw new Error("PWRC_FINALITY_MUST_BE_FINALIZED");
    }
    if (policy.preflightCommitment !==
        "confirmed") {
        throw new Error("PWRC_PREFLIGHT_COMMITMENT_INVALID");
    }
    if (!Number.isInteger(policy.readMaxAttempts) ||
        policy.readMaxAttempts < 1 ||
        policy.readMaxAttempts > 10) {
        throw new Error("PWRC_RUNTIME_RETRY_ATTEMPTS_INVALID");
    }
    for (const value of [
        policy.rpcTimeoutMs,
        policy.readBaseDelayMs,
        policy.readMaxDelayMs,
        policy.confirmationTimeoutMs,
    ]) {
        if (!Number.isInteger(value) ||
            value <= 0 ||
            value > 300_000) {
            throw new Error("PWRC_RUNTIME_POLICY_INVALID");
        }
    }
    if (policy.readBaseDelayMs >
        policy.readMaxDelayMs) {
        throw new Error("PWRC_RUNTIME_RETRY_DELAY_INVALID");
    }
    if (policy.confirmationTimeoutMs <
        policy.rpcTimeoutMs) {
        throw new Error("PWRC_RUNTIME_CONFIRMATION_TIMEOUT_TOO_SMALL");
    }
}
//# sourceMappingURL=runtime.js.map