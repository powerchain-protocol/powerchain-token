export function bridgeReconciliationPolicy() {
  return {
    version:
      "1.0.0",
    completionRequires: [
      "sourceEvidenceSha256",
      "destinationEvidenceSha256",
      "reconciliationSha256",
    ],
    evidence: {
      "solana-to-sui": {
        source: [
          "solanaTransactionSignature",
          "solanaFinalizedSlot",
          "canonicalLockedBaseUnits",
          "sourceObservationTimestamp",
        ],
        destination: [
          "suiTransactionDigest",
          "suiCheckpoint",
          "wrappedMintBaseUnits",
          "destinationObservationTimestamp",
        ],
      },
      "sui-to-solana": {
        source: [
          "suiTransactionDigest",
          "suiCheckpoint",
          "wrappedBurnBaseUnits",
          "sourceObservationTimestamp",
        ],
        destination: [
          "solanaTransactionSignature",
          "solanaFinalizedSlot",
          "canonicalReleaseGrossBaseUnits",
          "destinationObservationTimestamp",
        ],
      },
    },
    rules: {
      sourceAndDestinationAmountsMustMatchPrincipal:
        true,
      sourceAndDestinationChainsMustMatchDirection:
        true,
      commitmentsDeterministic:
        true,
      completionWithoutBothFinalityProofs:
        false,
      publicWrites:
        false,
    },
  };
}
