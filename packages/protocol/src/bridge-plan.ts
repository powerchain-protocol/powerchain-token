import {
  type BridgeDirection,
  type BridgeIntent,
} from "./bridge-settlement.js";

export type BridgePlanStepKind =
  | "SOURCE_PREPARE"
  | "SOURCE_SUBMIT"
  | "SOURCE_FINALITY"
  | "DESTINATION_PREPARE"
  | "DESTINATION_SUBMIT"
  | "DESTINATION_FINALITY"
  | "RECONCILE";

export interface BridgePlanStep {
  index:
    number;
  kind:
    BridgePlanStepKind;
  chain:
    "solana" |
    "sui" |
    "both";
  requiresPrevious:
    boolean;
  monetaryWrite:
    boolean;
  idempotent:
    boolean;
  retryPolicy:
    "never-blind" |
    "safe-read-only";
}

export interface BridgeExecutionPlan {
  version:
    "1.0.0";
  intentId:
    string;
  direction:
    BridgeDirection;
  sourceChain:
    "solana" |
    "sui";
  destinationChain:
    "solana" |
    "sui";
  publicApiWrites:
    false;
  blindRetry:
    false;
  steps:
    readonly BridgePlanStep[];
}

function chainsForDirection(
  direction:
    BridgeDirection,
): {
  source:
    "solana" |
    "sui";
  destination:
    "solana" |
    "sui";
} {
  return direction ===
    "solana-to-sui"
    ? {
        source:
          "solana",
        destination:
          "sui",
      }
    : {
        source:
          "sui",
        destination:
          "solana",
      };
}

export function buildBridgeExecutionPlan(
  intent:
    BridgeIntent,
): BridgeExecutionPlan {
  if (
    intent.phase !==
      "CREATED"
  ) {
    throw new Error(
      "PWRC_BRIDGE_PLAN_REQUIRES_CREATED_INTENT",
    );
  }

  const chains =
    chainsForDirection(
      intent.direction,
    );

  const steps:
    readonly BridgePlanStep[] =
    [
      {
        index: 0,
        kind:
          "SOURCE_PREPARE",
        chain:
          chains.source,
        requiresPrevious:
          false,
        monetaryWrite:
          false,
        idempotent:
          true,
        retryPolicy:
          "safe-read-only",
      },
      {
        index: 1,
        kind:
          "SOURCE_SUBMIT",
        chain:
          chains.source,
        requiresPrevious:
          true,
        monetaryWrite:
          true,
        idempotent:
          false,
        retryPolicy:
          "never-blind",
      },
      {
        index: 2,
        kind:
          "SOURCE_FINALITY",
        chain:
          chains.source,
        requiresPrevious:
          true,
        monetaryWrite:
          false,
        idempotent:
          true,
        retryPolicy:
          "safe-read-only",
      },
      {
        index: 3,
        kind:
          "DESTINATION_PREPARE",
        chain:
          chains.destination,
        requiresPrevious:
          true,
        monetaryWrite:
          false,
        idempotent:
          true,
        retryPolicy:
          "safe-read-only",
      },
      {
        index: 4,
        kind:
          "DESTINATION_SUBMIT",
        chain:
          chains.destination,
        requiresPrevious:
          true,
        monetaryWrite:
          true,
        idempotent:
          false,
        retryPolicy:
          "never-blind",
      },
      {
        index: 5,
        kind:
          "DESTINATION_FINALITY",
        chain:
          chains.destination,
        requiresPrevious:
          true,
        monetaryWrite:
          false,
        idempotent:
          true,
        retryPolicy:
          "safe-read-only",
      },
      {
        index: 6,
        kind:
          "RECONCILE",
        chain:
          "both",
        requiresPrevious:
          true,
        monetaryWrite:
          false,
        idempotent:
          true,
        retryPolicy:
          "safe-read-only",
      },
    ];

  return {
    version:
      "1.0.0",
    intentId:
      intent.intentId,
    direction:
      intent.direction,
    sourceChain:
      chains.source,
    destinationChain:
      chains.destination,
    publicApiWrites:
      false,
    blindRetry:
      false,
    steps,
  };
}

export interface BridgeEvidenceRequirement {
  phase:
    "SOURCE_FINALIZED" |
    "DESTINATION_FINALIZED" |
    "COMPLETED";
  required:
    readonly string[];
}

export function bridgeEvidenceRequirements(
  direction:
    BridgeDirection,
): readonly BridgeEvidenceRequirement[] {
  const sourceFinality =
    direction ===
      "solana-to-sui"
      ? [
          "solanaTransactionSignature",
          "solanaFinalizedSlot",
          "canonicalLockedBaseUnits",
          "sourceObservationTimestamp",
        ]
      : [
          "suiTransactionDigest",
          "suiCheckpoint",
          "wrappedBurnBaseUnits",
          "sourceObservationTimestamp",
        ];

  const destinationFinality =
    direction ===
      "solana-to-sui"
      ? [
          "suiTransactionDigest",
          "suiCheckpoint",
          "wrappedMintBaseUnits",
          "destinationObservationTimestamp",
        ]
      : [
          "solanaTransactionSignature",
          "solanaFinalizedSlot",
          "canonicalReleaseGrossBaseUnits",
          "destinationObservationTimestamp",
        ];

  return [
    {
      phase:
        "SOURCE_FINALIZED",
      required:
        sourceFinality,
    },
    {
      phase:
        "DESTINATION_FINALIZED",
      required:
        destinationFinality,
    },
    {
      phase:
        "COMPLETED",
      required: [
        "sourceEvidenceSha256",
        "destinationEvidenceSha256",
        "reconciliationSha256",
      ],
    },
  ];
}
