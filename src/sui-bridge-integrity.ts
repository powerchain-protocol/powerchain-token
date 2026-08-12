import { createHash } from "node:crypto";
import { canonicalJson } from "./canonical-json.js";

export interface CrossChainSupplyObservation {
  version: "1.0.0";
  solanaLockedBaseUnits: bigint;
  suiWrappedSupplyBaseUnits: bigint;
  pendingSolanaToSuiBaseUnits: bigint;
  pendingSuiToSolanaBaseUnits: bigint;
  solanaSlot: bigint;
  suiCheckpoint: bigint;
  observedAt: string;
}

export interface CrossChainSupplyEvidence {
  valid: boolean;
  effectiveWrappedExposureBaseUnits: bigint;
  backingSurplusBaseUnits: bigint;
  sha256: string;
  errors: string[];
}

export function verifyCrossChainSupply(
  observation: CrossChainSupplyObservation,
): CrossChainSupplyEvidence {
  const errors: string[] = [];
  const values = [
    observation.solanaLockedBaseUnits,
    observation.suiWrappedSupplyBaseUnits,
    observation.pendingSolanaToSuiBaseUnits,
    observation.pendingSuiToSolanaBaseUnits,
    observation.solanaSlot,
    observation.suiCheckpoint,
  ];
  if (values.some((x) => x < 0n)) errors.push("NEGATIVE_OBSERVATION_VALUE");

  const exposure =
    observation.suiWrappedSupplyBaseUnits +
    observation.pendingSolanaToSuiBaseUnits -
    observation.pendingSuiToSolanaBaseUnits;

  if (exposure < 0n) errors.push("NEGATIVE_WRAPPED_EXPOSURE");
  if (exposure > observation.solanaLockedBaseUnits) {
    errors.push("WRAPPED_EXPOSURE_EXCEEDS_LOCKED_PWRC");
  }

  const surplus =
    exposure >= 0n && observation.solanaLockedBaseUnits >= exposure
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
