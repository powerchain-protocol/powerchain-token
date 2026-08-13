import { createHash } from "node:crypto";
import { canonicalJson } from "./canonical-json.js";
export function verifyCrossChainSupply(observation) {
    const errors = [];
    const values = [
        observation.solanaLockedBaseUnits,
        observation.suiWrappedSupplyBaseUnits,
        observation.pendingSolanaToSuiBaseUnits,
        observation.pendingSuiToSolanaBaseUnits,
        observation.solanaSlot,
        observation.suiCheckpoint,
    ];
    if (values.some((x) => x < 0n))
        errors.push("NEGATIVE_OBSERVATION_VALUE");
    const exposure = observation.suiWrappedSupplyBaseUnits +
        observation.pendingSolanaToSuiBaseUnits +
        observation.pendingSuiToSolanaBaseUnits;
    if (exposure < 0n)
        errors.push("NEGATIVE_WRAPPED_EXPOSURE");
    if (exposure > observation.solanaLockedBaseUnits) {
        errors.push("WRAPPED_EXPOSURE_EXCEEDS_LOCKED_PWRC");
    }
    const surplus = exposure >= 0n && observation.solanaLockedBaseUnits >= exposure
        ? observation.solanaLockedBaseUnits - exposure
        : 0n;
    const hashable = {
        ...observation,
        solanaLockedBaseUnits: observation.solanaLockedBaseUnits.toString(),
        suiWrappedSupplyBaseUnits: observation.suiWrappedSupplyBaseUnits.toString(),
        pendingSolanaToSuiBaseUnits: observation.pendingSolanaToSuiBaseUnits.toString(),
        pendingSuiToSolanaBaseUnits: observation.pendingSuiToSolanaBaseUnits.toString(),
        solanaSlot: observation.solanaSlot.toString(),
        suiCheckpoint: observation.suiCheckpoint.toString(),
    };
    const sha256 = createHash("sha256")
        .update(canonicalJson(hashable))
        .digest("hex");
    return {
        valid: errors.length === 0,
        effectiveWrappedExposureBaseUnits: exposure,
        backingSurplusBaseUnits: surplus,
        sha256,
        errors,
    };
}
//# sourceMappingURL=sui-bridge-integrity.js.map