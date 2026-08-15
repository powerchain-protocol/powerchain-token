export function bridgeLifecyclePolicy() {
  return {
    version:
      "1.0.0",
    phases: [
      "CREATED",
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "COMPLETED",
      "FAILED",
    ],
    completionSequence: [
      "CREATED",
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "COMPLETED",
    ],
    rules: {
      sourceFinalityRequiredBeforeDestinationSubmission:
        true,
      destinationFinalityRequiredBeforeCompletion:
        true,
      completedTerminal:
        true,
      failedTerminal:
        true,
      blindRetry:
        false,
      publicSettlementWrites:
        false,
    },
  };
}
