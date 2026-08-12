export const PWRC_OPERATION_POLICY_VERSION = "1.0.0" as const;

export type PwrcOperationClass =
  | "signed-message"
  | "authentication"
  | "service-handshake"
  | "health-check"
  | "status"
  | "metadata"
  | "market-discovery"
  | "market-data"
  | "quote-preview"
  | "price-observation"
  | "proof"
  | "attestation"
  | "simulation"
  | "transfer"
  | "swap-settlement"
  | "fee-settlement"
  | "bridge-settlement"
  | "x402-settlement"
  | "checkout-settlement";

export interface PwrcOperationRule {
  operation: PwrcOperationClass;
  monetary: boolean;
  amountRequired: boolean;
  zeroAmountAllowed: boolean;
  signatureAllowed: boolean;
}

const ZERO_OK = new Set<PwrcOperationClass>([
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

const SETTLEMENT = new Set<PwrcOperationClass>([
  "transfer",
  "swap-settlement",
  "fee-settlement",
  "bridge-settlement",
  "x402-settlement",
  "checkout-settlement",
]);

export function operationRule(
  operation: PwrcOperationClass,
): PwrcOperationRule {
  const monetary = SETTLEMENT.has(operation);
  return {
    operation,
    monetary,
    amountRequired: monetary,
    zeroAmountAllowed: ZERO_OK.has(operation),
    signatureAllowed: true,
  };
}

export function assertOperationAmount(
  operation: PwrcOperationClass,
  amountBaseUnits?: bigint,
): void {
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

export function assertSignedMessagePayload(message: Uint8Array): void {
  if (message.length === 0) throw new Error("PWRC_SIGNED_MESSAGE_EMPTY");
  if (message.length > 8_192) throw new Error("PWRC_SIGNED_MESSAGE_TOO_LARGE");
}
