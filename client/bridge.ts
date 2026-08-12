import {
  verifyBridgeConservation,
  type PWRCBridgeConservationReport,
  type PWRCBridgeSupplyObservation,
} from "../src/bridge.js";

export interface PWRCBridgeSnapshot {
  canonicalMint: string;
  wrappedCoinType: string;
  lockedCanonicalBaseUnits: bigint;
  wrappedSupplyBaseUnits: bigint;
  pendingCanonicalToWrappedBaseUnits?: bigint;
  pendingWrappedToCanonicalBaseUnits?: bigint;
}

export function verifyPWRCBridgeSnapshot(
  snapshot: PWRCBridgeSnapshot,
): PWRCBridgeConservationReport {
  if (!snapshot.canonicalMint) {
    throw new Error("PWRC_BRIDGE_CANONICAL_MINT_REQUIRED");
  }
  if (!snapshot.wrappedCoinType) {
    throw new Error("PWRC_BRIDGE_WRAPPED_COIN_TYPE_REQUIRED");
  }

  const observation: PWRCBridgeSupplyObservation = {
    lockedCanonicalBaseUnits: snapshot.lockedCanonicalBaseUnits,
    wrappedSupplyBaseUnits: snapshot.wrappedSupplyBaseUnits,
  };

  if (snapshot.pendingCanonicalToWrappedBaseUnits !== undefined) {
    observation.pendingCanonicalToWrappedBaseUnits =
      snapshot.pendingCanonicalToWrappedBaseUnits;
  }
  if (snapshot.pendingWrappedToCanonicalBaseUnits !== undefined) {
    observation.pendingWrappedToCanonicalBaseUnits =
      snapshot.pendingWrappedToCanonicalBaseUnits;
  }

  return verifyBridgeConservation(observation);
}
