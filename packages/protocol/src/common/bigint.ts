export const U64_MAX = 18_446_744_073_709_551_615n;

export function assertU64(
  value: bigint,
  code = "POWERCHAIN_U64_OUT_OF_RANGE",
): bigint {
  if (value < 0n || value > U64_MAX) {
    throw new Error(code);
  }
  return value;
}

export function assertPositiveU64(
  value: bigint,
  code = "POWERCHAIN_AMOUNT_INVALID",
): bigint {
  assertU64(value, code);
  if (value === 0n) throw new Error(code);
  return value;
}

export function bigintMin(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function bigintMax(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}
