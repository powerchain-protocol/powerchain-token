export type RelayerJobState = "OBSERVED" | "FINALITY_CONFIRMED" | "IDENTITY_VERIFIED" | "CONSERVATION_VERIFIED" | "AUTHORIZED" | "SIMULATED" | "SUBMITTED" | "FINALIZED" | "RECONCILED" | "COMPLETED" | "BLOCKED" | "DEAD_LETTER";
export declare function assertRelayerTransition(from: RelayerJobState, to: RelayerJobState): void;
//# sourceMappingURL=state.d.ts.map