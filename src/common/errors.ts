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
} as const;

export type PowerChainErrorCodeValue =
  (typeof PowerChainErrorCode)[keyof typeof PowerChainErrorCode];

export class PowerChainError extends Error {
  readonly code: PowerChainErrorCodeValue;
  readonly cause?: unknown;
  constructor(code: PowerChainErrorCodeValue, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "PowerChainError";
    this.code = code;
    this.cause = options?.cause;
  }
}

export function invariant(
  condition: unknown,
  code: PowerChainErrorCodeValue,
  message: string,
): asserts condition {
  if (!condition) throw new PowerChainError(code, message);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
