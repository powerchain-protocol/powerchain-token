import { evaluateBridgeConservation, } from "./conservation.js";
export function evaluateConservationSnapshot(input) {
    const base = evaluateBridgeConservation({
        canonicalLiveSupplyBaseUnits: input.canonicalLiveSupplyBaseUnits,
        lockedCanonicalBaseUnits: input.lockedCanonicalBaseUnits,
        wrappedSupplyBaseUnits: input.suiWrappedSupplyBaseUnits,
        pendingSolanaToSuiBaseUnits: input.pendingSolanaToSuiCanonicalBaseUnits,
        pendingSuiToSolanaBaseUnits: input.pendingSuiToSolanaCanonicalBaseUnits,
    });
    const errors = [...base.errors];
    if (input.solanaSlot <= 0n) {
        errors.push("SOLANA_SLOT_INVALID");
    }
    if (input.suiCheckpoint <= 0n) {
        errors.push("SUI_CHECKPOINT_INVALID");
    }
    return {
        healthy: errors.length === 0,
        effectiveWrappedExposureBaseUnits: base.effectiveWrappedExposureBaseUnits,
        // Compatibility alias: both assets now share one 9-decimal base-unit domain.
        effectiveWrappedExposureCanonicalBaseUnits: base.effectiveWrappedExposureBaseUnits,
        errors,
    };
}
//# sourceMappingURL=watcher.js.map