export declare const PowerChainErrorCode: {
    readonly InvalidAmount: "POWERCHAIN_INVALID_AMOUNT";
    readonly InvalidState: "POWERCHAIN_INVALID_STATE";
    readonly InvalidAddress: "POWERCHAIN_INVALID_ADDRESS";
    readonly InvalidVersion: "POWERCHAIN_INVALID_VERSION";
    readonly InvalidConfiguration: "POWERCHAIN_INVALID_CONFIGURATION";
    readonly Timeout: "POWERCHAIN_TIMEOUT";
    readonly ProviderUnavailable: "POWERCHAIN_PROVIDER_UNAVAILABLE";
    readonly ProviderDisagreement: "POWERCHAIN_PROVIDER_DISAGREEMENT";
    readonly SimulationFailed: "POWERCHAIN_SIMULATION_FAILED";
    readonly TransactionFailed: "POWERCHAIN_TRANSACTION_FAILED";
    readonly AmbiguousWrite: "POWERCHAIN_AMBIGUOUS_WRITE";
    readonly OperationFailed: "POWERCHAIN_OPERATION_FAILED";
    readonly ReplayDetected: "POWERCHAIN_REPLAY_DETECTED";
    readonly ConservationViolation: "POWERCHAIN_CONSERVATION_VIOLATION";
    readonly CapacityExceeded: "POWERCHAIN_CAPACITY_EXCEEDED";
};
export type PowerChainErrorCodeValue = (typeof PowerChainErrorCode)[keyof typeof PowerChainErrorCode];
export declare class PowerChainError extends Error {
    readonly code: PowerChainErrorCodeValue;
    constructor(code: PowerChainErrorCodeValue, message: string, options?: {
        cause?: unknown;
    });
}
export declare function invariant(condition: unknown, code: PowerChainErrorCodeValue, message: string): asserts condition;
export declare function errorMessage(error: unknown): string;
//# sourceMappingURL=errors.d.ts.map