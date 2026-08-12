export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function invariant(
  condition: unknown,
  code: string,
): asserts condition {
  if (!condition) throw new Error(code);
}

export function assertPositiveBigInt(
  value: bigint,
  code = "POWERCHAIN_AMOUNT_MUST_BE_POSITIVE",
): void {
  if (value <= 0n) throw new Error(code);
}

export function assertNonEmptyString(
  value: string,
  code = "POWERCHAIN_STRING_REQUIRED",
): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(code);
  return normalized;
}

export function assertExactBytes(
  value: Uint8Array,
  length: number,
  code = "POWERCHAIN_BYTES_LENGTH_INVALID",
): Uint8Array {
  if (value.length !== length) throw new Error(code);
  return value;
}
