export class FixedWindowRateLimiter {
  #entries =
    new Map();

  constructor({
    limit,
    windowMs,
    maxEntries = 10_000,
  }) {
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      !Number.isSafeInteger(windowMs) ||
      windowMs < 1 ||
      !Number.isSafeInteger(maxEntries) ||
      maxEntries < 1
    ) {
      throw new Error(
        "PWRC_RATE_LIMIT_CONFIG_INVALID",
      );
    }

    this.limit =
      limit;
    this.windowMs =
      windowMs;
    this.maxEntries =
      maxEntries;
  }

  consume(
    key,
    now = Date.now(),
  ) {
    const safeKey =
      typeof key === "string" &&
      key
        ? key
        : "unknown";

    const existing =
      this.#entries.get(
        safeKey,
      );

    const record =
      !existing ||
      now >=
        existing.resetAt
        ? {
            count: 0,
            resetAt:
              now +
              this.windowMs,
          }
        : existing;

    record.count += 1;

    this.#entries.set(
      safeKey,
      record,
    );

    if (
      this.#entries.size >
      this.maxEntries
    ) {
      this.#prune(now);
    }

    return {
      allowed:
        record.count <=
        this.limit,
      limit:
        this.limit,
      remaining:
        Math.max(
          0,
          this.limit -
            record.count,
        ),
      resetAt:
        record.resetAt,
    };
  }

  #prune(now) {
    for (
      const [key, value]
      of this.#entries
    ) {
      if (
        now >=
        value.resetAt
      ) {
        this.#entries.delete(
          key,
        );
      }

      if (
        this.#entries.size <=
        this.maxEntries
      ) {
        break;
      }
    }

    while (
      this.#entries.size >
      this.maxEntries
    ) {
      const first =
        this.#entries
          .keys()
          .next()
          .value;

      if (
        first === undefined
      ) {
        break;
      }

      this.#entries.delete(
        first,
      );
    }
  }
}

export function clientRateLimitKey(
  request,
) {
  const address =
    request.socket
      ?.remoteAddress;

  return typeof address ===
      "string" &&
    address
      ? address
      : "unknown";
}
