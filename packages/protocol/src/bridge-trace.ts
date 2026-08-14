import {
  canonicalJsonSha256,
} from "./helpers.js";

export type BridgeDirection =
  | "solana-to-sui"
  | "sui-to-solana";

export interface BridgeOperationIdentity {
  version: "1.0.0";
  direction: BridgeDirection;
  sourceChain: "solana" | "sui";
  destinationChain: "solana" | "sui";
  sourceTransaction: string;
  sourcePosition: string;
  amountBaseUnits: string;
  destination: string;
}

export interface BridgeOperationTrace
  extends BridgeOperationIdentity {
  operationId: string;
  fingerprintSha256: string;
}

function assertPositiveDecimal(
  value: string,
): void {
  if (
    !/^[1-9][0-9]*$/.test(
      value,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_TRACE_AMOUNT_INVALID",
    );
  }
}

export function createBridgeOperationTrace(
  input: BridgeOperationIdentity,
): BridgeOperationTrace {
  assertPositiveDecimal(
    input.amountBaseUnits,
  );

  if (
    !input.sourceTransaction.trim() ||
    !input.sourcePosition.trim() ||
    !input.destination.trim()
  ) {
    throw new Error(
      "PWRC_BRIDGE_TRACE_IDENTITY_REQUIRED",
    );
  }

  if (
    input.direction ===
      "solana-to-sui" &&
    (
      input.sourceChain !==
        "solana" ||
      input.destinationChain !==
        "sui"
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_TRACE_DIRECTION_MISMATCH",
    );
  }

  if (
    input.direction ===
      "sui-to-solana" &&
    (
      input.sourceChain !==
        "sui" ||
      input.destinationChain !==
        "solana"
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_TRACE_DIRECTION_MISMATCH",
    );
  }

  const fingerprintSha256 =
    canonicalJsonSha256(
      input,
    );

  return {
    ...input,
    operationId:
      `${input.direction}:${fingerprintSha256}`,
    fingerprintSha256,
  };
}

export function assertBridgeOperationTrace(
  trace: BridgeOperationTrace,
): void {
  const {
    operationId,
    fingerprintSha256,
    ...identity
  } = trace;

  const expected =
    createBridgeOperationTrace(
      identity,
    );

  if (
    operationId !==
      expected.operationId ||
    fingerprintSha256 !==
      expected.fingerprintSha256
  ) {
    throw new Error(
      "PWRC_BRIDGE_TRACE_FINGERPRINT_MISMATCH",
    );
  }
}

export type ReconciliationState =
  | "pending"
  | "confirmed"
  | "failed"
  | "unknown";

export interface ReconciliationResult {
  operationId: string;
  state: ReconciliationState;
  sourceFinalized: boolean;
  destinationObserved: boolean;
  retryAllowed: boolean;
}

export function reconciliationDecision(
  input: Omit<
    ReconciliationResult,
    "retryAllowed"
  >,
): ReconciliationResult {
  const retryAllowed =
    input.state ===
      "failed" &&
    input.sourceFinalized ===
      false &&
    input.destinationObserved ===
      false;

  return {
    ...input,
    retryAllowed,
  };
}
