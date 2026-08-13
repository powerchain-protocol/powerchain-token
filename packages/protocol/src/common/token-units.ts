export const PWRC_DECIMALS = 9 as const;
export const WPWRC_DECIMALS = 9 as const;

export const PWRC_SCALE = 1_000_000_000n;
export const WPWRC_SCALE = 1_000_000_000n;

export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;

export const PWRC_MAX_BASE_UNITS =
  18_446_000_000_000_000_000n;
export const WPWRC_MAX_BASE_UNITS =
  PWRC_MAX_BASE_UNITS;

export function canonicalToWrappedExact(
  canonicalBaseUnits: bigint,
): bigint {
  if (canonicalBaseUnits < 0n) {
    throw new Error("PWRC_CANONICAL_AMOUNT_NEGATIVE");
  }
  if (canonicalBaseUnits > PWRC_MAX_BASE_UNITS) {
    throw new Error("PWRC_AMOUNT_EXCEEDS_MAX");
  }
  return canonicalBaseUnits;
}

export function wrappedToCanonical(
  wrappedBaseUnits: bigint,
): bigint {
  if (wrappedBaseUnits < 0n) {
    throw new Error("WPWRC_AMOUNT_NEGATIVE");
  }
  if (wrappedBaseUnits > WPWRC_MAX_BASE_UNITS) {
    throw new Error("WPWRC_AMOUNT_EXCEEDS_MAX");
  }
  return wrappedBaseUnits;
}
