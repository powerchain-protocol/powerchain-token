import { PWRC_CANONICAL_MINT_ADDRESS, PWRC_MAX_BASE_UNITS, PWRC_TRANSFER_FEE_BPS, PWRC_MAX_TRANSFER_FEE_TOKENS, } from "./constants.js";
export const PWRC_BRIDGE_VERSION = "1.0.0";
export const PWRC_CANONICAL_CHAIN = "solana";
export const WPWRC_WRAPPED_CHAIN = "sui";
export const WPWRC_SYMBOL = "wPWRC";
export const PWRC_CANONICAL_DECIMALS = 9;
export const WPWRC_WRAPPED_DECIMALS = 9;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export const WPWRC_MAX_BASE_UNITS = PWRC_MAX_BASE_UNITS;
export const PWRC_BRIDGE_TRANSFER_FEE_BPS = PWRC_TRANSFER_FEE_BPS;
export const PWRC_BRIDGE_MAX_TRANSFER_FEE_TOKENS = PWRC_MAX_TRANSFER_FEE_TOKENS;
export function canonicalBaseUnitsToWrappedBaseUnitsExact(canonicalBaseUnits) {
    if (canonicalBaseUnits < 0n) {
        throw new Error("PWRC_CANONICAL_AMOUNT_NEGATIVE");
    }
    if (canonicalBaseUnits > PWRC_MAX_BASE_UNITS) {
        throw new Error("PWRC_CANONICAL_AMOUNT_EXCEEDS_MAX");
    }
    return canonicalBaseUnits;
}
export function wrappedBaseUnitsToCanonicalBaseUnits(wrappedBaseUnits) {
    if (wrappedBaseUnits < 0n) {
        throw new Error("WPWRC_WRAPPED_AMOUNT_NEGATIVE");
    }
    if (wrappedBaseUnits > WPWRC_MAX_BASE_UNITS) {
        throw new Error("WPWRC_WRAPPED_AMOUNT_EXCEEDS_MAX");
    }
    return wrappedBaseUnits;
}
export function verifyBridgeConservation(observation) {
    const errors = [];
    const locked = observation.lockedCanonicalBaseUnits;
    const wrapped = observation.wrappedSupplyBaseUnits;
    const pendingToWrapped = observation.pendingCanonicalToWrappedBaseUnits ?? 0n;
    const pendingToCanonical = observation.pendingWrappedToCanonicalBaseUnits ?? 0n;
    if (locked < 0n)
        errors.push("NEGATIVE_LOCKED");
    if (wrapped < 0n)
        errors.push("NEGATIVE_WRAPPED");
    if (pendingToWrapped < 0n) {
        errors.push("NEGATIVE_PENDING_TO_WRAPPED");
    }
    if (pendingToCanonical < 0n) {
        errors.push("NEGATIVE_PENDING_TO_CANONICAL");
    }
    if (locked > PWRC_MAX_BASE_UNITS) {
        errors.push("LOCKED_CANONICAL_EXCEEDS_PWRC_MAX");
    }
    if (wrapped > WPWRC_MAX_BASE_UNITS) {
        errors.push("WRAPPED_SUPPLY_EXCEEDS_PWRC_MAX");
    }
    const effectiveWrappedExposureCanonical = wrapped + pendingToWrapped + pendingToCanonical;
    if (effectiveWrappedExposureCanonical < 0n) {
        errors.push("NEGATIVE_EFFECTIVE_WRAPPED_EXPOSURE");
    }
    if (effectiveWrappedExposureCanonical > locked) {
        errors.push("WRAPPED_SUPPLY_EXCEEDS_LOCKED_CANONICAL");
    }
    if (effectiveWrappedExposureCanonical > PWRC_MAX_BASE_UNITS) {
        errors.push("WRAPPED_EXPOSURE_EXCEEDS_PWRC_MAX");
    }
    const surplus = effectiveWrappedExposureCanonical >= 0n &&
        locked >= effectiveWrappedExposureCanonical
        ? locked - effectiveWrappedExposureCanonical
        : 0n;
    return {
        valid: errors.length === 0,
        errors,
        lockedCanonicalBaseUnits: locked,
        wrappedSupplyBaseUnits: wrapped,
        wrappedExposureCanonicalBaseUnits: effectiveWrappedExposureCanonical,
        pendingCanonicalToWrappedBaseUnits: pendingToWrapped,
        pendingWrappedToCanonicalBaseUnits: pendingToCanonical,
        surplusBackingBaseUnits: surplus,
    };
}
export function assertBridgeIdentity(identity) {
    if (identity.canonical.chain !== PWRC_CANONICAL_CHAIN) {
        throw new Error("PWRC_BRIDGE_CANONICAL_CHAIN_INVALID");
    }
    if (identity.wrapped.chain !== WPWRC_WRAPPED_CHAIN) {
        throw new Error("PWRC_BRIDGE_WRAPPED_CHAIN_INVALID");
    }
    if (identity.canonical.decimals !== PWRC_CANONICAL_DECIMALS) {
        throw new Error("PWRC_CANONICAL_DECIMALS_INVALID");
    }
    if (identity.wrapped.decimals !== WPWRC_WRAPPED_DECIMALS) {
        throw new Error("WPWRC_WRAPPED_DECIMALS_INVALID");
    }
    if (identity.canonical.mint !== null &&
        identity.canonical.mint !== PWRC_CANONICAL_MINT_ADDRESS) {
        throw new Error("PWRC_BRIDGE_CANONICAL_MINT_INVALID");
    }
    if (identity.wrapped.packageId !== null &&
        !/^0x[a-f0-9]{64}$/i.test(identity.wrapped.packageId)) {
        throw new Error("WPWRC_BRIDGE_PACKAGE_ID_INVALID");
    }
    if (identity.wrapped.coinType !== null &&
        identity.wrapped.packageId !== null &&
        !identity.wrapped.coinType.startsWith(`${identity.wrapped.packageId}::`)) {
        throw new Error("WPWRC_BRIDGE_COIN_TYPE_PACKAGE_MISMATCH");
    }
}
export function assertNonZeroBridgeAmount(canonicalAmountBaseUnits) {
    if (canonicalAmountBaseUnits <= 0n) {
        throw new Error("PWRC_ZERO_OR_NEGATIVE_BRIDGE_AMOUNT");
    }
    canonicalBaseUnitsToWrappedBaseUnitsExact(canonicalAmountBaseUnits);
}
//# sourceMappingURL=bridge.js.map