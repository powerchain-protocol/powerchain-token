export interface BurnUnpauseEvidence {
  version: "1.0.0";
  quarterId: string;
  solanaFinalized: boolean;
  canonicalSupplyMatchesPlan: boolean;
  suiCeilingFinalized: boolean;
  suiCeilingMatchesCanonicalSupply: boolean;
  bridgeConservationValid: boolean;
  pendingBurnIntentCleared: boolean;
  executionRecordState: "RECONCILED" | "COMPLETED";
}

export function assertBurnSafeToUnpause(
  evidence: BurnUnpauseEvidence,
): void {
  if (evidence.version !== "1.0.0") {
    throw new Error("PWRC_UNPAUSE_VERSION_INVALID");
  }

  const checks: Array<[boolean, string]> = [
    [evidence.solanaFinalized, "PWRC_UNPAUSE_SOLANA_NOT_FINALIZED"],
    [evidence.canonicalSupplyMatchesPlan, "PWRC_UNPAUSE_CANONICAL_SUPPLY_MISMATCH"],
    [evidence.suiCeilingFinalized, "PWRC_UNPAUSE_SUI_CEILING_NOT_FINALIZED"],
    [evidence.suiCeilingMatchesCanonicalSupply, "PWRC_UNPAUSE_SUI_CEILING_MISMATCH"],
    [evidence.bridgeConservationValid, "PWRC_UNPAUSE_CONSERVATION_INVALID"],
    [evidence.pendingBurnIntentCleared, "PWRC_UNPAUSE_PENDING_INTENT_NOT_CLEARED"],
    [
      evidence.executionRecordState === "RECONCILED" ||
        evidence.executionRecordState === "COMPLETED",
      "PWRC_UNPAUSE_EXECUTION_NOT_RECONCILED",
    ],
  ];

  for (const [ok, code] of checks) {
    if (!ok) throw new Error(code);
  }
}
