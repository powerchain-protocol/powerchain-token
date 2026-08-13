export async function withTimeout(operation, timeoutMs, externalSignal) {
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
        throw new Error("POWERCHAIN_TIMEOUT_INVALID");
    }
    if (externalSignal?.aborted) {
        throw externalSignal.reason ?? new Error("POWERCHAIN_ABORTED");
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("POWERCHAIN_TIMEOUT")), timeoutMs);
    const onAbort = () => {
        if (!controller.signal.aborted) {
            controller.abort(externalSignal?.reason ?? new Error("POWERCHAIN_ABORTED"));
        }
    };
    externalSignal?.addEventListener("abort", onAbort, { once: true });
    try {
        return await operation(controller.signal);
    }
    finally {
        clearTimeout(timer);
        externalSignal?.removeEventListener("abort", onAbort);
    }
}
//# sourceMappingURL=timeout.js.map