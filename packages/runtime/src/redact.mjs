const SECRET_KEY_PATTERN =
  /(secret|private|token|password|api[_-]?key|authorization|cookie|seed|mnemonic|signature)/i;

const BEARER_PATTERN =
  /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi;

const ASSIGNMENT_PATTERN =
  /\b(api[_-]?key|secret|token|password|authorization|cookie|seed|mnemonic)\s*[:=]\s*([^\s,;]+)/gi;

function redactUrlText(
  value,
) {
  return value.replace(
    /https?:\/\/[^\s"'<>]+/gi,
    (candidate) => {
      try {
        const url =
          new URL(candidate);

        if (
          url.username ||
          url.password
        ) {
          url.username =
            "[REDACTED]";
          url.password =
            "[REDACTED]";
        }

        for (
          const key of
          [...url.searchParams.keys()]
        ) {
          if (
            SECRET_KEY_PATTERN.test(
              key,
            )
          ) {
            url.searchParams.set(
              key,
              "[REDACTED]",
            );
          }
        }

        return url.toString();
      } catch {
        return candidate;
      }
    },
  );
}

export function redactText(
  value,
) {
  if (
    typeof value !== "string"
  ) {
    return value;
  }

  return redactUrlText(
    value
      .replace(
        BEARER_PATTERN,
        "Bearer [REDACTED]",
      )
      .replace(
        ASSIGNMENT_PATTERN,
        (_match, key) =>
          `${key}=[REDACTED]`,
      ),
  );
}

export function redactValue(
  value,
  key = "",
  seen = new WeakSet(),
) {
  if (
    SECRET_KEY_PATTERN.test(
      key,
    )
  ) {
    return "[REDACTED]";
  }

  if (
    typeof value === "string"
  ) {
    return redactText(value);
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return "[CIRCULAR]";
    }

    seen.add(value);

    try {
      return value.map(
        (item) =>
          redactValue(
            item,
            "",
            seen,
          ),
      );
    } finally {
      seen.delete(value);
    }
  }

  if (
    value &&
    typeof value === "object"
  ) {
    if (seen.has(value)) {
      return "[CIRCULAR]";
    }

    seen.add(value);

    try {
      return Object.fromEntries(
        Object.entries(value)
          .map(
            ([entryKey, entryValue]) => [
              entryKey,
              redactValue(
                entryValue,
                entryKey,
                seen,
              ),
            ],
          ),
      );
    } finally {
      seen.delete(value);
    }
  }

  return value;
}
