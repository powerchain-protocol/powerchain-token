export type IntegrationStage = "SOURCE_OBSERVED" | "SOURCE_FINALIZED" | "SOURCE_VERIFIED" | "DESTINATION_SIMULATED" | "DESTINATION_SUBMITTED" | "DESTINATION_FINALIZED" | "RECONCILED" | "COMPLETED" | "BLOCKED";
export declare function assertIntegrationTransition(from: IntegrationStage, to: IntegrationStage): void;
//# sourceMappingURL=finality.d.ts.map