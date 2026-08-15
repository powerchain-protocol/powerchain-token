import {
  canonicalJsonSha256,
} from "./helpers.js";
import type {
  BridgeDirection,
  BridgeSettlementPhase,
} from "./bridge-settlement.js";

export type BridgeAuditSeverity =
  | "INFO"
  | "WARN"
  | "ERROR"
  | "CRITICAL";

export type BridgeAuditEventKind =
  | "INTENT_CREATED"
  | "SOURCE_SUBMITTED"
  | "SOURCE_FINALIZED"
  | "DESTINATION_SUBMITTED"
  | "DESTINATION_FINALIZED"
  | "RECONCILIATION_COMPLETED"
  | "RECOVERY_DECISION"
  | "SETTLEMENT_COMPLETED"
  | "SETTLEMENT_FAILED";

export interface BridgeAuditEventInput {
  intentId:
    string;
  direction:
    BridgeDirection;
  phase:
    BridgeSettlementPhase;
  kind:
    BridgeAuditEventKind;
  severity:
    BridgeAuditSeverity;
  sequence:
    number;
  occurredAt:
    string;
  correlationId:
    string;
  previousEventSha256?:
    string | null;
  attributes?:
    Readonly<
      Record<
        string,
        string |
        number |
        boolean |
        null
      >
    >;
}

export interface BridgeAuditEvent
  extends BridgeAuditEventInput {
  version:
    "1.0.0";
  previousEventSha256:
    string |
    null;
  eventSha256:
    string;
}

const FORBIDDEN_ATTRIBUTE_KEYS =
  new Set([
    "privateKey",
    "secretKey",
    "seed",
    "mnemonic",
    "password",
    "authorization",
    "bearer",
    "apiKey",
    "token",
  ]);

function assertHex64(
  value:
    string,
  code:
    string,
): void {
  if (
    !/^[a-f0-9]{64}$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }
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
      "PWRC_BRIDGE_AUDIT_TIMESTAMP_INVALID",
    );
  }
}

function assertAttributesSafe(
  attributes:
    BridgeAuditEventInput["attributes"],
): void {
  if (!attributes) {
    return;
  }

  for (const key of Object.keys(attributes)) {
    if (
      FORBIDDEN_ATTRIBUTE_KEYS.has(
        key,
      )
    ) {
      throw new Error(
        `PWRC_BRIDGE_AUDIT_FORBIDDEN_ATTRIBUTE:${key}`,
      );
    }
  }
}

export function createBridgeAuditEvent(
  input:
    BridgeAuditEventInput,
): BridgeAuditEvent {
  assertHex64(
    input.intentId,
    "PWRC_BRIDGE_AUDIT_INTENT_INVALID",
  );

  if (
    !Number.isSafeInteger(
      input.sequence,
    ) ||
    input.sequence < 0
  ) {
    throw new Error(
      "PWRC_BRIDGE_AUDIT_SEQUENCE_INVALID",
    );
  }

  if (
    !/^[A-Za-z0-9._:-]{8,128}$/.test(
      input.correlationId,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_AUDIT_CORRELATION_ID_INVALID",
    );
  }

  assertIsoTimestamp(
    input.occurredAt,
  );

  if (
    input.previousEventSha256
  ) {
    assertHex64(
      input.previousEventSha256,
      "PWRC_BRIDGE_AUDIT_PREVIOUS_HASH_INVALID",
    );
  }

  assertAttributesSafe(
    input.attributes,
  );

  const previousEventSha256 =
    input.previousEventSha256 ??
    null;

  const payload = {
    version:
      "1.0.0" as const,
    intentId:
      input.intentId,
    direction:
      input.direction,
    phase:
      input.phase,
    kind:
      input.kind,
    severity:
      input.severity,
    sequence:
      input.sequence,
    occurredAt:
      input.occurredAt,
    correlationId:
      input.correlationId,
    previousEventSha256,
    attributes:
      input.attributes ??
      {},
  };

  return {
    ...payload,
    eventSha256:
      canonicalJsonSha256(
        payload,
      ),
  };
}

export function assertBridgeAuditChain(
  events:
    readonly BridgeAuditEvent[],
): void {
  let previous:
    BridgeAuditEvent |
    null =
    null;

  for (
    let index = 0;
    index <
      events.length;
    index += 1
  ) {
    const event =
      events[index];

    if (!event) {
      throw new Error(
        "PWRC_BRIDGE_AUDIT_EVENT_MISSING",
      );
    }

    if (
      event.sequence !==
        index
    ) {
      throw new Error(
        "PWRC_BRIDGE_AUDIT_SEQUENCE_GAP",
      );
    }

    const expectedPrevious =
      previous
        ?.eventSha256 ??
      null;

    if (
      event
        .previousEventSha256 !==
      expectedPrevious
    ) {
      throw new Error(
        "PWRC_BRIDGE_AUDIT_CHAIN_BROKEN",
      );
    }

    const rebuilt =
      createBridgeAuditEvent({
        intentId:
          event.intentId,
        direction:
          event.direction,
        phase:
          event.phase,
        kind:
          event.kind,
        severity:
          event.severity,
        sequence:
          event.sequence,
        occurredAt:
          event.occurredAt,
        correlationId:
          event.correlationId,
        previousEventSha256:
          event.previousEventSha256,
        attributes:
          event.attributes,
      });

    if (
      rebuilt.eventSha256 !==
        event.eventSha256
    ) {
      throw new Error(
        "PWRC_BRIDGE_AUDIT_EVENT_HASH_MISMATCH",
      );
    }

    previous =
      event;
  }
}

export function classifyBridgeIncidentSeverity(
  input: {
    reconciliationMismatch:
      boolean;
    destinationWriteUncertain:
      boolean;
    sourceWriteUncertain:
      boolean;
    providerUnavailable:
      boolean;
  },
): BridgeAuditSeverity {
  if (
    input
      .reconciliationMismatch
  ) {
    return "CRITICAL";
  }

  if (
    input
      .destinationWriteUncertain ||
    input
      .sourceWriteUncertain
  ) {
    return "ERROR";
  }

  if (
    input
      .providerUnavailable
  ) {
    return "WARN";
  }

  return "INFO";
}
