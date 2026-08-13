export type RelayerJobState =
  | "OBSERVED"
  | "FINALITY_CONFIRMED"
  | "IDENTITY_VERIFIED"
  | "CONSERVATION_VERIFIED"
  | "AUTHORIZED"
  | "SIMULATED"
  | "SUBMITTED"
  | "FINALIZED"
  | "RECONCILED"
  | "COMPLETED"
  | "BLOCKED"
  | "DEAD_LETTER";

const allowed: Record<RelayerJobState, readonly RelayerJobState[]> = {
  OBSERVED: ["FINALITY_CONFIRMED", "BLOCKED"],
  FINALITY_CONFIRMED: ["IDENTITY_VERIFIED", "BLOCKED"],
  IDENTITY_VERIFIED: ["CONSERVATION_VERIFIED", "BLOCKED"],
  CONSERVATION_VERIFIED: ["AUTHORIZED", "BLOCKED"],
  AUTHORIZED: ["SIMULATED", "BLOCKED"],
  SIMULATED: ["SUBMITTED", "BLOCKED"],
  SUBMITTED: ["FINALIZED", "BLOCKED"],
  FINALIZED: ["RECONCILED", "BLOCKED"],
  RECONCILED: ["COMPLETED", "BLOCKED"],
  COMPLETED: [],
  BLOCKED: ["OBSERVED", "DEAD_LETTER"],
  DEAD_LETTER: [],
};

export function assertRelayerTransition(
  from: RelayerJobState,
  to: RelayerJobState,
): void {
  if (!allowed[from].includes(to)) {
    throw new Error(`PWRC_RELAYER_INVALID_TRANSITION:${from}->${to}`);
  }
}
