export declare const PWRC_BRIDGE_VERSION: "1.0.0";
export declare const PWRC_CANONICAL_CHAIN: "solana";
export declare const WPWRC_WRAPPED_CHAIN: "sui";
export declare const WPWRC_SYMBOL: "wPWRC";
export declare const PWRC_CANONICAL_DECIMALS: 9;
export declare const WPWRC_WRAPPED_DECIMALS: 9;
export declare const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: 1n;
export declare const WPWRC_MAX_BASE_UNITS: bigint;
export declare const PWRC_BRIDGE_TRANSFER_FEE_BPS = 250n;
export declare const PWRC_BRIDGE_MAX_TRANSFER_FEE_TOKENS = 1000000n;
export type PWRCBridgeStatus = "template-only" | "devnet-configured" | "devnet-verified" | "mainnet-configured" | "mainnet-verified";
export interface PWRCBridgeIdentity {
    canonical: {
        chain: "solana";
        mint: string | null;
        decimals: 9;
    };
    wrapped: {
        chain: "sui";
        coinType: string | null;
        packageId: string | null;
        decimals: 9;
    };
}
/**
 * Conservation inputs are always in the common 9-decimal base-unit domain.
 * `lockedCanonicalBaseUnits` is the net spendable PWRC credited to bridge
 * backing after any Token-2022 transfer fee on a Solana -> Sui lock.
 *
 * A pending Sui -> Solana amount has already left wrapped circulation but is
 * still backed until the canonical release finalizes, so it remains exposure
 * and is added here rather than subtracted.
 */
export interface PWRCBridgeSupplyObservation {
    lockedCanonicalBaseUnits: bigint;
    wrappedSupplyBaseUnits: bigint;
    pendingCanonicalToWrappedBaseUnits?: bigint;
    pendingWrappedToCanonicalBaseUnits?: bigint;
}
export interface PWRCBridgeConservationReport {
    valid: boolean;
    errors: string[];
    lockedCanonicalBaseUnits: bigint;
    wrappedSupplyBaseUnits: bigint;
    wrappedExposureCanonicalBaseUnits: bigint;
    pendingCanonicalToWrappedBaseUnits: bigint;
    pendingWrappedToCanonicalBaseUnits: bigint;
    surplusBackingBaseUnits: bigint;
}
export declare function canonicalBaseUnitsToWrappedBaseUnitsExact(canonicalBaseUnits: bigint): bigint;
export declare function wrappedBaseUnitsToCanonicalBaseUnits(wrappedBaseUnits: bigint): bigint;
export declare function verifyBridgeConservation(observation: PWRCBridgeSupplyObservation): PWRCBridgeConservationReport;
export declare function assertBridgeIdentity(identity: PWRCBridgeIdentity): void;
export declare function assertNonZeroBridgeAmount(canonicalAmountBaseUnits: bigint): void;
//# sourceMappingURL=bridge.d.ts.map