export function assertHex32(value: string, code = "POWERCHAIN_HEX32_INVALID"): string {
  const normalized = value.trim().toLowerCase();
  if (!/^(?:0x)?[a-f0-9]{64}$/.test(normalized)) throw new Error(code);
  return normalized.startsWith("0x") ? normalized : `0x${normalized}`;
}

export function assertNonEmpty(value: string, code = "POWERCHAIN_VALUE_REQUIRED"): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(code);
  return normalized;
}
