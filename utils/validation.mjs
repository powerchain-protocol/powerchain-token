export function assertSha256Hex(
  value,
  label = "sha256",
) {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{64}$/i.test(
      value,
    )
  ) {
    throw new Error(
      `${label}:invalid-sha256`,
    );
  }

  return value.toLowerCase();
}

export function assertSafeInteger(
  value,
  {
    label = "integer",
    min =
      Number.MIN_SAFE_INTEGER,
    max =
      Number.MAX_SAFE_INTEGER,
  } = {},
) {
  if (
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(
      `${label}:invalid-safe-integer`,
    );
  }

  return value;
}

export function assertNonEmptyString(
  value,
  label = "string",
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label}:required`,
    );
  }

  return value.trim();
}
