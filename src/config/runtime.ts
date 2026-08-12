export const POWERCHAIN_RUNTIME_VERSION = "1.0.0" as const;

export interface PowerChainRuntimePolicy {
  rpcTimeoutMs: number;
  readMaxAttempts: number;
  readBaseDelayMs: number;
  readMaxDelayMs: number;
  confirmationTimeoutMs: number;
  blindWriteRetries: false;
  finality: "finalized";
  preflightCommitment: "confirmed";
}

export const DEFAULT_RUNTIME_POLICY: PowerChainRuntimePolicy = {
  rpcTimeoutMs: 10_000,
  readMaxAttempts: 4,
  readBaseDelayMs: 250,
  readMaxDelayMs: 4_000,
  confirmationTimeoutMs: 60_000,
  blindWriteRetries: false,
  finality: "finalized",
  preflightCommitment: "confirmed",
};

export function assertRuntimePolicy(policy: PowerChainRuntimePolicy): void {
  if (policy.blindWriteRetries !== false) throw new Error("PWRC_BLIND_WRITE_RETRIES_FORBIDDEN");
  if (policy.finality !== "finalized") throw new Error("PWRC_FINALITY_MUST_BE_FINALIZED");
  if (policy.preflightCommitment !== "confirmed") throw new Error("PWRC_PREFLIGHT_COMMITMENT_INVALID");
  for (const value of [
    policy.rpcTimeoutMs,
    policy.readMaxAttempts,
    policy.readBaseDelayMs,
    policy.readMaxDelayMs,
    policy.confirmationTimeoutMs,
  ]) {
    if (!Number.isInteger(value) || value <= 0) throw new Error("PWRC_RUNTIME_POLICY_INVALID");
  }
}
