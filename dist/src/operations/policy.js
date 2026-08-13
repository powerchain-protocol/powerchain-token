export const PWRC_OPERATION_POLICY_VERSION = "1.0.0";
const ZERO_OK = new Set([
    "signed-message",
    "authentication",
    "service-handshake",
    "health-check",
    "status",
    "metadata",
    "market-discovery",
    "market-data",
    "quote-preview",
    "price-observation",
    "proof",
    "attestation",
    "simulation",
]);
const SETTLEMENT = new Set([
    "transfer",
    "swap-settlement",
    "fee-settlement",
    "bridge-settlement",
    "x402-settlement",
    "checkout-settlement",
]);
export function operationRule(operation) {
    const monetary = SETTLEMENT.has(operation);
    return {
        operation,
        monetary,
        amountRequired: monetary,
        zeroAmountAllowed: ZERO_OK.has(operation),
        signatureAllowed: true,
    };
}
export function assertOperationAmount(operation, amountBaseUnits) {
    const rule = operationRule(operation);
    if (!rule.amountRequired) {
        if (amountBaseUnits !== undefined && amountBaseUnits < 0n) {
            throw new Error("PWRC_OPERATION_NEGATIVE_AMOUNT");
        }
        return;
    }
    if (amountBaseUnits === undefined) {
        throw new Error(`PWRC_${operation.toUpperCase().replace(/-/g, "_")}_AMOUNT_REQUIRED`);
    }
    if (amountBaseUnits <= 0n) {
        throw new Error(`PWRC_${operation.toUpperCase().replace(/-/g, "_")}_ZERO_AMOUNT`);
    }
}
export function assertSignedMessagePayload(message) {
    if (message.length === 0)
        throw new Error("PWRC_SIGNED_MESSAGE_EMPTY");
    if (message.length > 8_192)
        throw new Error("PWRC_SIGNED_MESSAGE_TOO_LARGE");
}
//# sourceMappingURL=policy.js.map