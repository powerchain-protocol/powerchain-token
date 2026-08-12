import { PWRC_MAX_BASE_UNITS } from "./constants.js";

export const PWRC_BRIDGE_VERSION = "1.0.0" as const;
export const PWRC_CANONICAL_CHAIN = "solana" as const;
export const WPWRC_WRAPPED_CHAIN = "sui" as const;
export const WPWRC_SYMBOL = "wPWRC" as const;

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
    decimals: 9;
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
  pendingCanonicalToWrappedBaseUnits: bigint;
  pendingWrappedToCanonicalBaseUnits: bigint;
  effectiveBackingBaseUnits: bigint;
  surplusBackingBaseUnits: bigint;
}

export function verifyBridgeConservation(
  observation: PWRCBridgeSupplyObservation,
): PWRCBridgeConservationReport {
  const errors: string[] = [];
  const locked = observation.lockedCanonicalBaseUnits;
  const wrapped = observation.wrappedSupplyBaseUnits;
  const pendingToWrapped = observation.pendingCanonicalToWrappedBaseUnits ?? 0n;
  const pendingToCanonical = observation.pendingWrappedToCanonicalBaseUnits ?? 0n;

  for (const [name, value] of [
    ["locked", locked],
    ["wrapped", wrapped],
    ["pendingToWrapped", pendingToWrapped],
    ["pendingToCanonical", pendingToCanonical],
  ] as const) {
    if (value < 0n) errors.push(`NEGATIVE_${name.toUpperCase()}`);
    if (value > PWRC_MAX_BASE_UNITS) errors.push(`EXCEEDS_MAX_${name.toUpperCase()}`);
  }

  // Conservative backing rule:
  // wrapped already outstanding + canonical->wrapped pending must be fully backed
  // by canonical currently locked. Pending wrapped->canonical reduces effective
  // wrapped exposure because those wrapped units are expected to be burned.
  const effectiveWrappedExposure =
    wrapped + pendingToWrapped - pendingToCanonical;

  if (effectiveWrappedExposure < 0n) {
    errors.push("NEGATIVE_EFFECTIVE_WRAPPED_EXPOSURE");
  }

  if (effectiveWrappedExposure > locked) {
    errors.push("WRAPPED_SUPPLY_EXCEEDS_LOCKED_CANONICAL");
  }

  if (wrapped > PWRC_MAX_BASE_UNITS) {
    errors.push("WRAPPED_SUPPLY_EXCEEDS_PWRC_MAX");
  }

  const surplus =
    effectiveWrappedExposure >= 0n && locked >= effectiveWrappedExposure
      ? locked - effectiveWrappedExposure
      : 0n;

  return {
    valid: errors.length === 0,
    errors,
    lockedCanonicalBaseUnits: locked,
    wrappedSupplyBaseUnits: wrapped,
    pendingCanonicalToWrappedBaseUnits: pendingToWrapped,
    pendingWrappedToCanonicalBaseUnits: pendingToCanonical,
    effectiveBackingBaseUnits: locked,
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
  if (identity.canonical.decimals !== 9 || identity.wrapped.decimals !== 9) {
    throw new Error("PWRC_BRIDGE_DECIMALS_MISMATCH");
  }
}

export function assertNonZeroBridgeAmount(amountBaseUnits: bigint): void {
  if (amountBaseUnits <= 0n) {
    throw new Error("PWRC_ZERO_OR_NEGATIVE_BRIDGE_AMOUNT");
  }
}
