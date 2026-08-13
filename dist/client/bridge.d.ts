import { type PWRCBridgeConservationReport } from "../src/bridge.js";
export interface PWRCBridgeSnapshot {
    canonicalMint: string;
    wrappedCoinType: string;
    lockedCanonicalBaseUnits: bigint;
    wrappedSupplyBaseUnits: bigint;
    pendingCanonicalToWrappedBaseUnits?: bigint;
    pendingWrappedToCanonicalBaseUnits?: bigint;
}
export declare function verifyPWRCBridgeSnapshot(snapshot: PWRCBridgeSnapshot): PWRCBridgeConservationReport;
//# sourceMappingURL=bridge.d.ts.map