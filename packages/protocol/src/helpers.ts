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


const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function decodedBase58Length(
  value:
    string,
): number {
  if (
    !/^[1-9A-HJ-NP-Za-km-z]+$/.test(
      value,
    )
  ) {
    return -1;
  }

  const bytes = [
    0,
  ];

  for (
    const character of
      value
  ) {
    const digit =
      BASE58_ALPHABET.indexOf(
        character,
      );

    if (
      digit <
        0
    ) {
      return -1;
    }

    let carry =
      digit;

    for (
      let index =
        0;
      index <
        bytes.length;
      index +=
        1
    ) {
      const current =
        bytes[index] *
          58 +
        carry;

      bytes[index] =
        current &
        0xff;
      carry =
        current >>
        8;
    }

    while (
      carry >
        0
    ) {
      bytes.push(
        carry &
          0xff,
      );
      carry >>=
        8;
    }
  }

  let leadingZeroes =
    0;

  while (
    leadingZeroes <
      value.length &&
    value[
      leadingZeroes
    ] ===
      "1"
  ) {
    leadingZeroes +=
      1;
  }

  const significantLength =
    bytes.length ===
      1 &&
    bytes[0] ===
      0
      ? 0
      : bytes.length;

  return (
    leadingZeroes +
    significantLength
  );
}

export function assertBase58Bytes(
  value:
    string,
  expectedBytes:
    number,
  code:
    string,
): string {
  if (
    !Number.isSafeInteger(
      expectedBytes,
    ) ||
    expectedBytes <=
      0
  ) {
    throw new Error(
      "PWRC_BASE58_EXPECTED_BYTES_INVALID",
    );
  }

  const normalized =
    value.trim();

  if (
    !normalized ||
    decodedBase58Length(
      normalized,
    ) !==
      expectedBytes
  ) {
    throw new Error(
      code,
    );
  }

  return normalized;
}

export function assertSolana32ByteBase58(
  value:
    string,
  code:
    string,
): string {
  const normalized =
    value.trim();

  if (
    normalized.length <
      32 ||
    normalized.length >
      44
  ) {
    throw new Error(
      code,
    );
  }

  return assertBase58Bytes(
    normalized,
    32,
    code,
  );
}

export function sha256Hex(
  value: string | Uint8Array,
): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}


export function canonicalJson(
  value:
    unknown,
): string {
  const seen =
    new Set<object>();

  function encode(
    current:
      unknown,
  ): string {
    if (
      current ===
        null
    ) {
      return "null";
    }

    switch (
      typeof current
    ) {
      case "string":
      case "boolean":
        return JSON.stringify(
          current,
        );

      case "bigint":
        return JSON.stringify(
          current.toString(),
        );

      case "number": {
        if (
          !Number.isFinite(
            current,
          )
        ) {
          throw new Error(
            "PWRC_CANONICAL_JSON_NON_FINITE_NUMBER",
          );
        }

        return JSON.stringify(
          Object.is(
            current,
            -0,
          )
            ? 0
            : current,
        );
      }

      case "undefined":
        throw new Error(
          "PWRC_CANONICAL_JSON_UNDEFINED",
        );

      case "function":
      case "symbol":
        throw new Error(
          "PWRC_CANONICAL_JSON_UNSUPPORTED_TYPE",
        );

      case "object":
        break;

      default:
        throw new Error(
          "PWRC_CANONICAL_JSON_UNSUPPORTED_TYPE",
        );
    }

    const object =
      current as object;

    if (
      seen.has(
        object,
      )
    ) {
      throw new Error(
        "PWRC_CANONICAL_JSON_CYCLE",
      );
    }

    seen.add(
      object,
    );

    try {
      if (
        Array.isArray(
          current,
        )
      ) {
        const encoded =
          current
            .map(
              (
                entry,
              ) =>
                encode(
                  entry,
                ),
            )
            .join(",");

        return `[${encoded}]`;
      }

      const prototype =
        Object.getPrototypeOf(
          current,
        );

      if (
        prototype !==
          Object.prototype &&
        prototype !==
          null
      ) {
        throw new Error(
          "PWRC_CANONICAL_JSON_NON_PLAIN_OBJECT",
        );
      }

      const record =
        current as
          Record<
            string,
            unknown
          >;

      const entries =
        Object.keys(
          record,
        )
          .sort()
          .filter(
            (
              key,
            ) =>
              record[
                key
              ] !==
              undefined,
          )
          .map(
            (
              key,
            ) =>
              `${JSON.stringify(key)}:${encode(record[key])}`,
          );

      return `{${entries.join(",")}}`;
    } finally {
      seen.delete(
        object,
      );
    }
  }

  return encode(
    value,
  );
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
