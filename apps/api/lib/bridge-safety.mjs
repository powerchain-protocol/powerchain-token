export function bridgeSafetyPolicy() {
  return {
    version:
      "1.0.0",
    publicWrites:
      false,
    decisions: [
      "acceptNewIntents",
      "allowDestinationSubmission",
      "allowCompletion",
      "operatorAttentionRequired",
    ],
    gates: {
      governancePause:
        true,
      riskPauseOrHalt:
        true,
      sourceFinality:
        true,
      destinationFinality:
        true,
      reconciliationVerification:
        true,
      auditChainValidity:
        true,
      recoveryState:
        true,
    },
    rules: {
      destinationSubmissionRequiresSourceFinality:
        true,
      completionRequiresDestinationFinality:
        true,
      completionRequiresReconciliation:
        true,
      invalidAuditBlocksProgress:
        true,
      recoveryBlocksProgress:
        true,
      riskHaltBlocksProgress:
        true,
      pauseBlocksNewIntents:
        true,
      publicControlWrites:
        false,
    },
  };
}
