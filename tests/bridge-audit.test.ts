import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgeAuditChain,
  classifyBridgeIncidentSeverity,
  createBridgeAuditEvent,
} from "../packages/protocol/src/bridge-audit.js";

const intentId =
  "e".repeat(64);

test(
  "bridge audit events form a deterministic hash chain",
  () => {
    const first =
      createBridgeAuditEvent({
        intentId,
        direction:
          "solana-to-sui",
        phase:
          "CREATED",
        kind:
          "INTENT_CREATED",
        severity:
          "INFO",
        sequence:
          0,
        occurredAt:
          "2026-08-15T00:00:00.000Z",
        correlationId:
          "pwrc-audit-0001",
        attributes: {
          principalBaseUnits:
            "1000000000",
        },
      });

    const second =
      createBridgeAuditEvent({
        intentId,
        direction:
          "solana-to-sui",
        phase:
          "SOURCE_FINALIZED",
        kind:
          "SOURCE_FINALIZED",
        severity:
          "INFO",
        sequence:
          1,
        occurredAt:
          "2026-08-15T00:00:05.000Z",
        correlationId:
          "pwrc-audit-0001",
        previousEventSha256:
          first.eventSha256,
        attributes: {
          finalizedSlot:
            "123",
        },
      });

    assertBridgeAuditChain([
      first,
      second,
    ]);

    assert.match(
      first.eventSha256,
      /^[a-f0-9]{64}$/,
    );
    assert.equal(
      second.previousEventSha256,
      first.eventSha256,
    );
  },
);

test(
  "audit chain detects tampering",
  () => {
    const first =
      createBridgeAuditEvent({
        intentId,
        direction:
          "sui-to-solana",
        phase:
          "CREATED",
        kind:
          "INTENT_CREATED",
        severity:
          "INFO",
        sequence:
          0,
        occurredAt:
          "2026-08-15T00:00:00.000Z",
        correlationId:
          "pwrc-audit-0002",
      });

    assert.throws(
      () =>
        assertBridgeAuditChain([
          {
            ...first,
            eventSha256:
              "f".repeat(64),
          },
        ]),
      /PWRC_BRIDGE_AUDIT_EVENT_HASH_MISMATCH/,
    );
  },
);

test(
  "audit attributes reject secrets",
  () => {
    assert.throws(
      () =>
        createBridgeAuditEvent({
          intentId,
          direction:
            "solana-to-sui",
          phase:
            "CREATED",
          kind:
            "INTENT_CREATED",
          severity:
            "INFO",
          sequence:
            0,
          occurredAt:
            "2026-08-15T00:00:00.000Z",
          correlationId:
            "pwrc-audit-0003",
          attributes: {
            privateKey:
              "never-log-this",
          },
        }),
      /PWRC_BRIDGE_AUDIT_FORBIDDEN_ATTRIBUTE:privateKey/,
    );
  },
);

test(
  "incident severity prioritizes reconciliation mismatch",
  () => {
    assert.equal(
      classifyBridgeIncidentSeverity({
        reconciliationMismatch:
          true,
        destinationWriteUncertain:
          false,
        sourceWriteUncertain:
          false,
        providerUnavailable:
          false,
      }),
      "CRITICAL",
    );

    assert.equal(
      classifyBridgeIncidentSeverity({
        reconciliationMismatch:
          false,
        destinationWriteUncertain:
          true,
        sourceWriteUncertain:
          false,
        providerUnavailable:
          false,
      }),
      "ERROR",
    );

    assert.equal(
      classifyBridgeIncidentSeverity({
        reconciliationMismatch:
          false,
        destinationWriteUncertain:
          false,
        sourceWriteUncertain:
          false,
        providerUnavailable:
          true,
      }),
      "WARN",
    );
  },
);
