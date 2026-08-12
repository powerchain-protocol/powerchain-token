export interface IntegrationReconciliation {
  lockedPwrcBaseUnits: bigint;
  circulatingWpwrcBaseUnits: bigint;
  /** Finalized canonical PWRC lock not yet minted on Sui. */
  pendingSolanaToSuiBaseUnits: bigint;
  /** Finalized wPWRC burn not yet released from Solana custody. */
  pendingSuiToSolanaBaseUnits: bigint;
}

export function bridgeExposureBaseUnits(
  input: IntegrationReconciliation,
): bigint {
  const values = Object.values(input);
  if (values.some((value) => value < 0n)) {
    throw new Error(
      "PWRC_INTEGRATION_NEGATIVE_BALANCE",
    );
  }

  return (
    input.circulatingWpwrcBaseUnits +
    input.pendingSolanaToSuiBaseUnits +
    input.pendingSuiToSolanaBaseUnits
  );
}

export function assertBridgeConservation(
  input: IntegrationReconciliation,
): void {
  const exposure =
    bridgeExposureBaseUnits(input);

  if (exposure !== input.lockedPwrcBaseUnits) {
    throw new Error(
      "PWRC_INTEGRATION_CONSERVATION_MISMATCH",
    );
  }
}
