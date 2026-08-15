export function bridgeAuditPolicy() {
  return {
    version:
      "1.0.0",
    hashChain:
      true,
    correlationIds:
      true,
    publicWrites:
      false,
    eventKinds: [
      "INTENT_CREATED",
      "SOURCE_SUBMITTED",
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "RECONCILIATION_COMPLETED",
      "RECOVERY_DECISION",
      "SETTLEMENT_COMPLETED",
      "SETTLEMENT_FAILED",
    ],
    severities: [
      "INFO",
      "WARN",
      "ERROR",
      "CRITICAL",
    ],
    sensitiveAttributesForbidden: [
      "privateKey",
      "secretKey",
      "seed",
      "mnemonic",
      "password",
      "authorization",
      "bearer",
      "apiKey",
      "token",
    ],
    rules: {
      deterministicEventHash:
        true,
      previousEventHashRequiredAfterGenesis:
        true,
      contiguousSequenceRequired:
        true,
      replayTamperingDetected:
        true,
      reconciliationMismatchCritical:
        true,
      uncertainMonetaryWriteError:
        true,
      providerUnavailableWarning:
        true,
    },
  };
}
