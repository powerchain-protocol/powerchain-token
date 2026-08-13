export class TtlCache {
  #value;
  #expiresAt = 0;

  constructor({
    ttlMs,
  }) {
    if (
      !Number.isSafeInteger(ttlMs) ||
      ttlMs < 1 ||
      ttlMs > 60_000
    ) {
      throw new Error(
        "PWRC_CACHE_TTL_INVALID",
      );
    }

    this.ttlMs =
      ttlMs;
  }

  get(
    loader,
    now = Date.now(),
  ) {
    if (
      this.#value !==
        undefined &&
      now <
        this.#expiresAt
    ) {
      return this.#value;
    }

    const value =
      loader();

    this.#value =
      value;
    this.#expiresAt =
      now +
      this.ttlMs;

    return value;
  }

  clear() {
    this.#value =
      undefined;
    this.#expiresAt =
      0;
  }
}
