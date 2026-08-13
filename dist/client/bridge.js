import { verifyBridgeConservation, } from "../src/bridge.js";
export function verifyPWRCBridgeSnapshot(snapshot) {
    if (!snapshot.canonicalMint) {
        throw new Error("PWRC_BRIDGE_CANONICAL_MINT_REQUIRED");
    }
    if (!snapshot.wrappedCoinType) {
        throw new Error("PWRC_BRIDGE_WRAPPED_COIN_TYPE_REQUIRED");
    }
    const observation = {
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
//# sourceMappingURL=bridge.js.map