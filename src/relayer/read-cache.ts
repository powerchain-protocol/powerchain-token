interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export class ReadThroughCache {
  readonly #cache = new Map<string, CacheEntry<unknown>>();
  readonly #inflight = new Map<string, Promise<unknown>>();

  constructor(readonly ttlMs = 2_000, readonly maxEntries = 256) {
    if (!Number.isInteger(ttlMs) || ttlMs < 0) {
      throw new Error("PWRC_READ_CACHE_TTL_INVALID");
    }
    if (!Number.isInteger(maxEntries) || maxEntries < 1) {
      throw new Error("PWRC_READ_CACHE_SIZE_INVALID");
    }
  }

  async getOrLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.#cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;

    const inFlight = this.#inflight.get(key);
    if (inFlight) return inFlight as Promise<T>;

    const promise = loader()
      .then((value) => {
        if (this.#cache.size >= this.maxEntries) {
          const oldest = this.#cache.keys().next().value;
          if (oldest) this.#cache.delete(oldest);
        }
        this.#cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
        return value;
      })
      .finally(() => this.#inflight.delete(key));

    this.#inflight.set(key, promise);
    return promise;
  }

  clear(): void { this.#cache.clear(); }
}
