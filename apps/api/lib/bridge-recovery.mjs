export function bridgeRecoveryPolicy() {
  return {
    version:
      "1.0.0",
    automaticWriteRetry:
      false,
    readRetry:
      true,
    actions: [
      "ABORT",
      "WAIT_SOURCE_FINALITY",
      "WAIT_DESTINATION_FINALITY",
      "REFRESH_EVIDENCE",
      "RECONCILE",
      "MANUAL_REVIEW",
    ],
    rules: {
      unknownSourceWriteOutcomeRequiresManualReview:
        true,
      unknownDestinationWriteOutcomeRequiresManualReview:
        true,
      finalityTimeoutUsesReadOnlyPolling:
        true,
      staleEvidenceMustBeRefreshed:
        true,
      reconciliationMismatchTerminal:
        true,
      completedSettlementTerminal:
        true,
      publicWrites:
        false,
    },
    evidenceFreshness: {
      enforced:
        true,
      futureTimestampsRejected:
        true,
      maxAgeConfiguredByCaller:
        true,
    },
  };
}
