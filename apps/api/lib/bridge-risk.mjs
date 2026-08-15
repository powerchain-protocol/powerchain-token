export function bridgeRiskPolicy() {
  return {
    version:
      "1.0.0",
    publicWrites:
      false,
    levels: [
      "NORMAL",
      "ELEVATED",
      "PAUSE_RECOMMENDED",
      "HALT_REQUIRED",
    ],
    rules: {
      undercollateralizationTrips:
        true,
      reconciliationMismatchTrips:
        true,
      pendingExposureLimit:
        true,
      pendingOperationLimit:
        true,
      staleEvidenceTripsPauseRecommendation:
        true,
      newBridgeIntentsBlockedWhenPauseRecommended:
        true,
      automaticOnChainPause:
        false,
    },
    thresholds: {
      source:
        "deployment-configured",
      failClosedWhenMissing:
        true,
    },
  };
}
