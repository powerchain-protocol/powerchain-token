export type BridgeTransferState = "CREATED" | "SOURCE_SUBMITTED" | "SOURCE_FINALIZED" | "SOURCE_VERIFIED" | "DESTINATION_BUILT" | "DESTINATION_SIMULATED" | "DESTINATION_SUBMITTED" | "DESTINATION_FINALIZED" | "RECONCILED" | "COMPLETED" | "BLOCKED";
export declare function assertBridgeTransferTransition(from: BridgeTransferState, to: BridgeTransferState): void;
//# sourceMappingURL=state.d.ts.map