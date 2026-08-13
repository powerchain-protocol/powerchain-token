export class ReadThroughCache {
    ttlMs;
    maxEntries;
    #cache = new Map();
    #inflight = new Map();
    constructor(ttlMs = 2_000, maxEntries = 256) {
        this.ttlMs = ttlMs;
        this.maxEntries = maxEntries;
        if (!Number.isInteger(ttlMs) || ttlMs < 0) {
            throw new Error("PWRC_READ_CACHE_TTL_INVALID");
        }
        if (!Number.isInteger(maxEntries) || maxEntries < 1) {
            throw new Error("PWRC_READ_CACHE_SIZE_INVALID");
        }
    }
    async getOrLoad(key, loader) {
        const cached = this.#cache.get(key);
        if (cached && cached.expiresAt > Date.now())
            return cached.value;
        const inFlight = this.#inflight.get(key);
        if (inFlight)
            return inFlight;
        const promise = loader()
            .then((value) => {
            if (this.#cache.size >= this.maxEntries) {
                const oldest = this.#cache.keys().next().value;
                if (oldest)
                    this.#cache.delete(oldest);
            }
            this.#cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
            return value;
        })
            .finally(() => this.#inflight.delete(key));
        this.#inflight.set(key, promise);
        return promise;
    }
    clear() { this.#cache.clear(); }
}
//# sourceMappingURL=read-cache.js.map