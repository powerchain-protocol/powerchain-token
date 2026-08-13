function isPlainObject(
  value,
) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value,
    );

  return (
    prototype ===
      Object.prototype ||
    prototype === null
  );
}

export function normalizeCanonicalJson(
  value,
  seen = new WeakSet(),
) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "number"
  ) {
    if (!Number.isFinite(value)) {
      throw new Error(
        "POWERCHAIN_CANONICAL_JSON_NON_FINITE_NUMBER",
      );
    }

    // JSON.stringify normalizes -0 to 0. Do it explicitly.
    return Object.is(
      value,
      -0,
    )
      ? 0
      : value;
  }

  if (
    value === undefined ||
    typeof value === "bigint" ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    throw new Error(
      "POWERCHAIN_CANONICAL_JSON_UNSUPPORTED_VALUE",
    );
  }

  if (
    typeof value !== "object"
  ) {
    throw new Error(
      "POWERCHAIN_CANONICAL_JSON_UNSUPPORTED_VALUE",
    );
  }

  if (seen.has(value)) {
    throw new Error(
      "POWERCHAIN_CANONICAL_JSON_CYCLE",
    );
  }

  seen.add(value);

  try {
    if (Array.isArray(value)) {
      return value.map(
        (item) =>
          normalizeCanonicalJson(
            item,
            seen,
          ),
      );
    }

    if (!isPlainObject(value)) {
      throw new Error(
        "POWERCHAIN_CANONICAL_JSON_PLAIN_OBJECT_REQUIRED",
      );
    }

    const result =
      Object.create(null);

    for (
      const key of
      Object.keys(value)
        .sort()
    ) {
      const item =
        value[key];

      if (
        item === undefined
      ) {
        throw new Error(
          `POWERCHAIN_CANONICAL_JSON_UNDEFINED_PROPERTY:${key}`,
        );
      }

      result[key] =
        normalizeCanonicalJson(
          item,
          seen,
        );
    }

    return result;
  } finally {
    seen.delete(value);
  }
}

export function canonicalJsonStringify(
  value,
) {
  return JSON.stringify(
    normalizeCanonicalJson(
      value,
    ),
  );
}
