export function readPositiveInteger(
  value: string | undefined,
  fallback: number,
  options?: {
    min?: number;
    max?: number;
  },
): number {
  const min = options?.min ?? 1;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;

  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  if (!/^[0-9]+$/.test(value.trim())) {
    throw new Error("POWERCHAIN_CONFIG_INTEGER_INVALID");
  }

  const parsed = Number(value);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error("POWERCHAIN_CONFIG_INTEGER_OUT_OF_RANGE");
  }

  return parsed;
}

export function readBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error("POWERCHAIN_CONFIG_BOOLEAN_INVALID");
}
