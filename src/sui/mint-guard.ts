export function assertSuiMintWithinLiveCeiling(input: {
  canonicalLiveSupplyBaseUnits: bigint;
  suiCanonicalSupplyCeilingBaseUnits: bigint;
  currentSuiWrappedSupplyBaseUnits: bigint;
  requestedMintBaseUnits: bigint;
}): void {
  if (input.requestedMintBaseUnits <= 0n) {
    throw new Error("WPWRC_MINT_AMOUNT_INVALID");
  }

  // Fail closed if the bridge's on-chain ceiling is stale relative to Solana.
  if (
    input.suiCanonicalSupplyCeilingBaseUnits !==
    input.canonicalLiveSupplyBaseUnits
  ) {
    throw new Error("WPWRC_CANONICAL_CEILING_STALE");
  }

  const after =
    input.currentSuiWrappedSupplyBaseUnits +
    input.requestedMintBaseUnits;

  if (after > input.canonicalLiveSupplyBaseUnits) {
    throw new Error("WPWRC_MINT_EXCEEDS_CANONICAL_LIVE_SUPPLY");
  }
}
