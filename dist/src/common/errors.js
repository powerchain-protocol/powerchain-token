export const PowerChainErrorCode = {
    InvalidAmount: "POWERCHAIN_INVALID_AMOUNT",
    InvalidState: "POWERCHAIN_INVALID_STATE",
    InvalidAddress: "POWERCHAIN_INVALID_ADDRESS",
    InvalidVersion: "POWERCHAIN_INVALID_VERSION",
    InvalidConfiguration: "POWERCHAIN_INVALID_CONFIGURATION",
    Timeout: "POWERCHAIN_TIMEOUT",
    ProviderUnavailable: "POWERCHAIN_PROVIDER_UNAVAILABLE",
    ProviderDisagreement: "POWERCHAIN_PROVIDER_DISAGREEMENT",
    SimulationFailed: "POWERCHAIN_SIMULATION_FAILED",
    TransactionFailed: "POWERCHAIN_TRANSACTION_FAILED",
    AmbiguousWrite: "POWERCHAIN_AMBIGUOUS_WRITE",
    OperationFailed: "POWERCHAIN_OPERATION_FAILED",
    ReplayDetected: "POWERCHAIN_REPLAY_DETECTED",
    ConservationViolation: "POWERCHAIN_CONSERVATION_VIOLATION",
    CapacityExceeded: "POWERCHAIN_CAPACITY_EXCEEDED",
};
export class PowerChainError extends Error {
    code;
    constructor(code, message, options) {
        super(message, options?.cause === undefined
            ? undefined
            : { cause: options.cause });
        this.name = "PowerChainError";
        this.code = code;
    }
}
export function invariant(condition, code, message) {
    if (!condition)
        throw new PowerChainError(code, message);
}
export function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=errors.js.map