import { PWRC_MAX_BASE_UNITS } from "./constants.js";

export const PWRC_BRIDGE_VERSION = "1.0.0" as const;
export const PWRC_CANONICAL_CHAIN = "solana" as const;
export const WPWRC_WRAPPED_CHAIN = "sui" as const;
export const WPWRC_SYMBOL = "wPWRC" as const;

export const PWRC_CANONICAL_DECIMALS = 9 as const;
export const WPWRC_WRAPPED_DECIMALS = 6 as const;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1000n as const;
export const WPWRC_MAX_BASE_UNITS =
  PWRC_MAX_BASE_UNITS / PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT;

export type PWRCBridgeStatus =
  | "template-only"
  | "devnet-configured"
  | "devnet-verified"
  | "mainnet-configured"
  | "mainnet-verified";

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
    decimals: 6;
  };
}

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

export function canonicalBaseUnitsToWrappedBaseUnitsExact(
  canonicalBaseUnits: bigint,
): bigint {
  if (canonicalBaseUnits < 0n) {
    throw new Error("PWRC_CANONICAL_AMOUNT_NEGATIVE");
  }
  if (
    canonicalBaseUnits % PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT !== 0n
  ) {
    throw new Error("PWRC_BRIDGE_AMOUNT_NOT_REPRESENTABLE_ON_SUI");
  }
  return canonicalBaseUnits / PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT;
}

export function wrappedBaseUnitsToCanonicalBaseUnits(
  wrappedBaseUnits: bigint,
): bigint {
  if (wrappedBaseUnits < 0n) {
    throw new Error("WPWRC_WRAPPED_AMOUNT_NEGATIVE");
  }
  return wrappedBaseUnits * PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT;
}

export function verifyBridgeConservation(
  observation: PWRCBridgeSupplyObservation,
): PWRCBridgeConservationReport {
  const errors: string[] = [];
  const locked = observation.lockedCanonicalBaseUnits;
  const wrapped = observation.wrappedSupplyBaseUnits;
  const pendingToWrapped =
    observation.pendingCanonicalToWrappedBaseUnits ?? 0n;
  const pendingToCanonical =
    observation.pendingWrappedToCanonicalBaseUnits ?? 0n;

  if (locked < 0n) errors.push("NEGATIVE_LOCKED");
  if (wrapped < 0n) errors.push("NEGATIVE_WRAPPED");
  if (pendingToWrapped < 0n) errors.push("NEGATIVE_PENDING_TO_WRAPPED");
  if (pendingToCanonical < 0n) errors.push("NEGATIVE_PENDING_TO_CANONICAL");

  if (locked > PWRC_MAX_BASE_UNITS) {
    errors.push("LOCKED_CANONICAL_EXCEEDS_PWRC_MAX");
  }
  if (wrapped > WPWRC_MAX_BASE_UNITS) {
    errors.push("WRAPPED_SUPPLY_EXCEEDS_WPWRC_MAX");
  }

  // Pending Solana -> Sui amounts are canonical (9-decimal) units and must
  // be exactly representable by the 6-decimal wPWRC asset.
  if (
    pendingToWrapped %
      PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT !==
    0n
  ) {
    errors.push("PENDING_TO_WRAPPED_NOT_REPRESENTABLE_ON_SUI");
  }

  const wrappedCanonical =
    wrappedBaseUnitsToCanonicalBaseUnits(wrapped);

  const effectiveWrappedExposureCanonical =
    wrappedCanonical + pendingToWrapped - pendingToCanonical;

  if (effectiveWrappedExposureCanonical < 0n) {
    errors.push("NEGATIVE_EFFECTIVE_WRAPPED_EXPOSURE");
  }

  if (effectiveWrappedExposureCanonical > locked) {
    errors.push("WRAPPED_SUPPLY_EXCEEDS_LOCKED_CANONICAL");
  }

  const surplus =
    effectiveWrappedExposureCanonical >= 0n &&
    locked >= effectiveWrappedExposureCanonical
      ? locked - effectiveWrappedExposureCanonical
      : 0n;

  return {
    valid: errors.length === 0,
    errors,
    lockedCanonicalBaseUnits: locked,
    wrappedSupplyBaseUnits: wrapped,
    wrappedExposureCanonicalBaseUnits:
      effectiveWrappedExposureCanonical,
    pendingCanonicalToWrappedBaseUnits: pendingToWrapped,
    pendingWrappedToCanonicalBaseUnits: pendingToCanonical,
    surplusBackingBaseUnits: surplus,
  };
}

export function assertBridgeIdentity(identity: PWRCBridgeIdentity): void {
  if (identity.canonical.chain !== "solana") {
    throw new Error("PWRC_BRIDGE_CANONICAL_CHAIN_INVALID");
  }
  if (identity.wrapped.chain !== "sui") {
    throw new Error("PWRC_BRIDGE_WRAPPED_CHAIN_INVALID");
  }
  if (identity.canonical.decimals !== PWRC_CANONICAL_DECIMALS) {
    throw new Error("PWRC_CANONICAL_DECIMALS_INVALID");
  }
  if (identity.wrapped.decimals !== WPWRC_WRAPPED_DECIMALS) {
    throw new Error("WPWRC_WRAPPED_DECIMALS_INVALID");
  }
}

export function assertNonZeroBridgeAmount(
  canonicalAmountBaseUnits: bigint,
): void {
  if (canonicalAmountBaseUnits <= 0n) {
    throw new Error("PWRC_ZERO_OR_NEGATIVE_BRIDGE_AMOUNT");
  }
  canonicalBaseUnitsToWrappedBaseUnitsExact(
    canonicalAmountBaseUnits,
  );
}
