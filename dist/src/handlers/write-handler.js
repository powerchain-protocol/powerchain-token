import { PowerChainError, PowerChainErrorCode, } from "../common/errors.js";
import { withTimeout } from "../common/timeout.js";
async function reconcileWithDeadline(input, signature) {
    const timeoutMs = input.reconciliationTimeoutMs ??
        60_000;
    try {
        return await withTimeout((signal) => input.reconcile(signature, signal), timeoutMs);
    }
    catch (error) {
        throw new PowerChainError(PowerChainErrorCode
            .AmbiguousWrite, `Write reconciliation timed out or failed:${signature}`, { cause: error });
    }
}
export async function handleChainWrite(input) {
    try {
        await input.simulate();
    }
    catch (error) {
        throw new PowerChainError(PowerChainErrorCode
            .SimulationFailed, "Chain write simulation failed", { cause: error });
    }
    let submitted;
    try {
        submitted =
            await input.submit();
    }
    catch (error) {
        const signature = input
            .signatureFromError?.(error)
            ?.trim();
        if (signature) {
            const state = await reconcileWithDeadline(input, signature);
            if (state === "finalized") {
                if (input
                    .recoverFinalizedResult) {
                    return {
                        signature,
                        result: await input
                            .recoverFinalizedResult(signature),
                    };
                }
                throw new PowerChainError(PowerChainErrorCode
                    .AmbiguousWrite, `Write finalized but submit result was lost:${signature}`, { cause: error });
            }
            if (state === "failed") {
                throw new PowerChainError(PowerChainErrorCode
                    .TransactionFailed, `Write failed:${signature}`, { cause: error });
            }
        }
        throw new PowerChainError(PowerChainErrorCode
            .AmbiguousWrite, "Write submission outcome is ambiguous; do not blind retry", { cause: error });
    }
    const signature = submitted.signature.trim();
    if (!signature) {
        throw new PowerChainError(PowerChainErrorCode
            .InvalidState, "Submitted write did not return a transaction signature");
    }
    const state = await reconcileWithDeadline(input, signature);
    if (state === "failed") {
        throw new PowerChainError(PowerChainErrorCode
            .TransactionFailed, `Write failed:${signature}`);
    }
    if (state !== "finalized") {
        throw new PowerChainError(PowerChainErrorCode
            .AmbiguousWrite, `Write requires reconciliation:${signature}`);
    }
    return {
        ...submitted,
        signature,
    };
}
//# sourceMappingURL=write-handler.js.map