export const PowerChainErrorCode = {
  InvalidAmount: "POWERCHAIN_INVALID_AMOUNT",
  InvalidState: "POWERCHAIN_INVALID_STATE",
  InvalidAddress: "POWERCHAIN_INVALID_ADDRESS",
  InvalidVersion: "POWERCHAIN_INVALID_VERSION",
  InvalidConfiguration: "POWERCHAIN_INVALID_CONFIGURATION",
  ProviderDisagreement: "POWERCHAIN_PROVIDER_DISAGREEMENT",
  ReplayDetected: "POWERCHAIN_REPLAY_DETECTED",
  ConservationViolation: "POWERCHAIN_CONSERVATION_VIOLATION",
  CapacityExceeded: "POWERCHAIN_CAPACITY_EXCEEDED",
} as const;

export type PowerChainErrorCodeValue =
  (typeof PowerChainErrorCode)[keyof typeof PowerChainErrorCode];

export class PowerChainError extends Error {
  readonly code: PowerChainErrorCodeValue;
  constructor(code: PowerChainErrorCodeValue, message: string) {
    super(message);
    this.name = "PowerChainError";
    this.code = code;
  }
}

export function invariant(
  condition: unknown,
  code: PowerChainErrorCodeValue,
  message: string,
): asserts condition {
  if (!condition) throw new PowerChainError(code, message);
}
