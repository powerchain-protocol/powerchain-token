export const PWRC_FORMAT_VERSION = 1;

export function assertFormatVersion(version: number): void {
  if (version !== PWRC_FORMAT_VERSION) {
    throw new Error("PWRC_UNSUPPORTED_FORMAT_VERSION");
  }
}

export function readExactBytes(
  input: Uint8Array,
  expectedLength: number,
): Uint8Array {
  if (input.length !== expectedLength) {
    throw new Error("PWRC_MALFORMED_OR_TRAILING_BYTES");
  }
  return input;
}
