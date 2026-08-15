import crypto from "node:crypto";
import {
  PWRC_GENESIS_BASE_UNITS,
} from "./constants.js";

export type BridgeDirection =
  | "solana-to-sui"
  | "sui-to-solana";

export type BridgeSettlementPhase =
  | "CREATED"
  | "SOURCE_FINALIZED"
  | "DESTINATION_SUBMITTED"
  | "DESTINATION_FINALIZED"
  | "COMPLETED"
  | "FAILED";

export interface BridgeIntentInput {
  direction:
    BridgeDirection;
  sourceChainId:
    string;
  destinationChainId:
    string;
  sourceAccount:
    string;
  destinationAccount:
    string;
  principalBaseUnits:
    bigint;
  quoteFingerprint:
    string;
  createdAt:
    string;
}

export interface BridgeIntent {
  version:
    "1.0.0";
  intentId:
    string;
  direction:
    BridgeDirection;
  sourceChainId:
    string;
  destinationChainId:
    string;
  sourceAccount:
    string;
  destinationAccount:
    string;
  principalBaseUnits:
    string;
  quoteFingerprint:
    string;
  createdAt:
    string;
  phase:
    BridgeSettlementPhase;
}

const PHASE_TRANSITIONS:
  Readonly<
    Record<
      BridgeSettlementPhase,
      readonly BridgeSettlementPhase[]
    >
  > =
  Object.freeze({
    CREATED: [
      "SOURCE_FINALIZED",
      "FAILED",
    ],
    SOURCE_FINALIZED: [
      "DESTINATION_SUBMITTED",
      "FAILED",
    ],
    DESTINATION_SUBMITTED: [
      "DESTINATION_FINALIZED",
      "FAILED",
    ],
    DESTINATION_FINALIZED: [
      "COMPLETED",
      "FAILED",
    ],
    COMPLETED: [],
    FAILED: [],
  });

function stableStringify(
  value:
    unknown,
): string {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return JSON.stringify(
      value,
    );
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return `[${value
      .map(
        stableStringify,
      )
      .join(",")}]`;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  return `{${Object
    .keys(record)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableStringify(record[key])}`,
    )
    .join(",")}}`;
}

function assertIsoTimestamp(
  value:
    string,
): void {
  const parsed =
    Date.parse(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    new Date(
      parsed,
    ).toISOString() !==
      value
  ) {
    throw new Error(
      "PWRC_BRIDGE_INTENT_TIMESTAMP_INVALID",
    );
  }
}

export function createBridgeIntent(
  input:
    BridgeIntentInput,
): BridgeIntent {
  if (
    input
      .principalBaseUnits <=
      0n ||
    input
      .principalBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_BRIDGE_INTENT_AMOUNT_INVALID",
    );
  }

  const sourceFamily =
    input.sourceChainId
      .trim()
      .split(
        ":",
        1,
      )[0];
  const destinationFamily =
    input.destinationChainId
      .trim()
      .split(
        ":",
        1,
      )[0];

  const expectedSourceFamily =
    input.direction ===
      "solana-to-sui"
      ? "solana"
      : "sui";
  const expectedDestinationFamily =
    input.direction ===
      "solana-to-sui"
      ? "sui"
      : "solana";

  if (
    sourceFamily !==
      expectedSourceFamily ||
    destinationFamily !==
      expectedDestinationFamily
  ) {
    throw new Error(
      "PWRC_BRIDGE_INTENT_CHAIN_DIRECTION_MISMATCH",
    );
  }

  if (
    input.sourceChainId.trim() ===
      input.destinationChainId.trim()
  ) {
    throw new Error(
      "PWRC_BRIDGE_INTENT_SAME_CHAIN_FORBIDDEN",
    );
  }

  if (
    !/^[a-f0-9]{64}$/.test(
      input.quoteFingerprint,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_INTENT_QUOTE_FINGERPRINT_INVALID",
    );
  }

  for (const value of [
    input.sourceChainId,
    input.destinationChainId,
    input.sourceAccount,
    input.destinationAccount,
  ]) {
    if (!value.trim()) {
      throw new Error(
        "PWRC_BRIDGE_INTENT_FIELD_REQUIRED",
      );
    }
  }

  assertIsoTimestamp(
    input.createdAt,
  );

  const payload = {
    version:
      "1.0.0",
    direction:
      input.direction,
    sourceChainId:
      input.sourceChainId,
    destinationChainId:
      input.destinationChainId,
    sourceAccount:
      input.sourceAccount,
    destinationAccount:
      input.destinationAccount,
    principalBaseUnits:
      input
        .principalBaseUnits
        .toString(),
    quoteFingerprint:
      input.quoteFingerprint,
    createdAt:
      input.createdAt,
  };

  const intentId =
    crypto
      .createHash(
        "sha256",
      )
      .update(
        "POWERCHAIN_BRIDGE_INTENT_V1\0",
      )
      .update(
        stableStringify(
          payload,
        ),
      )
      .digest(
        "hex",
      );

  return {
    ...payload,
    intentId,
    phase:
      "CREATED",
  };
}

export function canTransitionBridgeSettlement(
  from:
    BridgeSettlementPhase,
  to:
    BridgeSettlementPhase,
): boolean {
  return PHASE_TRANSITIONS[
    from
  ].includes(
    to,
  );
}

export function transitionBridgeSettlement(
  intent:
    BridgeIntent,
  to:
    BridgeSettlementPhase,
): BridgeIntent {
  if (
    !canTransitionBridgeSettlement(
      intent.phase,
      to,
    )
  ) {
    throw new Error(
      `PWRC_BRIDGE_SETTLEMENT_TRANSITION_INVALID:${intent.phase}:${to}`,
    );
  }

  return {
    ...intent,
    phase:
      to,
  };
}

export function assertBridgeCompletionSequence(
  phases:
    readonly BridgeSettlementPhase[],
): void {
  const required:
    readonly BridgeSettlementPhase[] =
    [
      "CREATED",
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "COMPLETED",
    ];

  if (
    phases.length !==
      required.length
  ) {
    throw new Error(
      "PWRC_BRIDGE_COMPLETION_SEQUENCE_INVALID",
    );
  }

  for (
    let index = 0;
    index <
      required.length;
    index += 1
  ) {
    if (
      phases[index] !==
      required[index]
    ) {
      throw new Error(
        "PWRC_BRIDGE_COMPLETION_SEQUENCE_INVALID",
      );
    }
  }
}
