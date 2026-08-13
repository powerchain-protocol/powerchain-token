export declare const PWRC_OPERATION_POLICY_VERSION: "1.0.0";
export type PwrcOperationClass = "signed-message" | "authentication" | "service-handshake" | "health-check" | "status" | "metadata" | "market-discovery" | "market-data" | "quote-preview" | "price-observation" | "proof" | "attestation" | "simulation" | "transfer" | "swap-settlement" | "fee-settlement" | "bridge-settlement" | "x402-settlement" | "checkout-settlement";
export interface PwrcOperationRule {
    operation: PwrcOperationClass;
    monetary: boolean;
    amountRequired: boolean;
    zeroAmountAllowed: boolean;
    signatureAllowed: boolean;
}
export declare function operationRule(operation: PwrcOperationClass): PwrcOperationRule;
export declare function assertOperationAmount(operation: PwrcOperationClass, amountBaseUnits?: bigint): void;
export declare function assertSignedMessagePayload(message: Uint8Array): void;
//# sourceMappingURL=policy.d.ts.map