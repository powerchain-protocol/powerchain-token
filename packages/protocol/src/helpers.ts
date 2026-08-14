import { createHash } from "node:crypto";

export function assertNonEmpty(
  value: string | undefined | null,
  code: string,
): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(code);
  return normalized;
}

export function assertPositiveBigInt(
  value: bigint,
  code = "PWRC_POSITIVE_AMOUNT_REQUIRED",
): bigint {
  if (value <= 0n) throw new Error(code);
  return value;
}

export function assertNonNegativeBigInt(
  value: bigint,
  code = "PWRC_NON_NEGATIVE_AMOUNT_REQUIRED",
): bigint {
  if (value < 0n) throw new Error(code);
  return value;
}

export function assertSafeInteger(
  value: number,
  code = "PWRC_SAFE_INTEGER_REQUIRED",
): number {
  if (!Number.isSafeInteger(value)) throw new Error(code);
  return value;
}

export function sha256Hex(
  value: string | Uint8Array,
): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

export function canonicalJson(
  value: unknown,
): string {
  if (value === null || typeof value !== "object") {
    if (typeof value === "bigint") return JSON.stringify(value.toString());
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);

  return `{${entries.join(",")}}`;
}

export function canonicalJsonSha256(
  value: unknown,
): string {
  return sha256Hex(canonicalJson(value));
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  code = "PWRC_TIMEOUT",
): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("PWRC_TIMEOUT_MS_INVALID");
  }

  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(code)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
