export function bigintMin(
  a: bigint,
  b: bigint,
): bigint {
  return a < b ? a : b;
}

export function bigintMax(
  a: bigint,
  b: bigint,
): bigint {
  return a > b ? a : b;
}

export function assertUint64(
  value: bigint,
  code = "POWERCHAIN_U64_INVALID",
): void {
  if (
    value < 0n ||
    value > 18_446_744_073_709_551_615n
  ) {
    throw new Error(code);
  }
}
