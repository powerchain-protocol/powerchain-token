export function reconcileQuarterlyBurn(input) {
    if (input.observedSolanaSupplyBaseUnits !==
        input.expectedPostBurnSupplyBaseUnits) {
        throw new Error("PWRC_BURN_SOLANA_SUPPLY_MISMATCH");
    }
    if (input.observedSuiCanonicalCeilingBaseUnits !==
        input.expectedPostBurnSupplyBaseUnits) {
        throw new Error("PWRC_BURN_SUI_CEILING_MISMATCH");
    }
    const effectiveExposure = input.observedSuiWrappedSupplyBaseUnits +
        input.pendingSolanaToSuiBaseUnits +
        input.pendingSuiToSolanaBaseUnits;
    if (effectiveExposure < 0n) {
        throw new Error("WPWRC_EFFECTIVE_EXPOSURE_NEGATIVE");
    }
    if (effectiveExposure > input.observedSolanaLockedBaseUnits) {
        throw new Error("WPWRC_EXPOSURE_EXCEEDS_LOCKED_CANONICAL");
    }
    if (effectiveExposure > input.observedSolanaSupplyBaseUnits) {
        throw new Error("WPWRC_EXPOSURE_EXCEEDS_CANONICAL_LIVE_SUPPLY");
    }
}
//# sourceMappingURL=reconcile.js.map