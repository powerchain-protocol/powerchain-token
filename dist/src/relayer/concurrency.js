export class BoundedExecutor {
    #maxConcurrency;
    #active = 0;
    #waiters = [];
    constructor(maxConcurrency = 4) {
        if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1 || maxConcurrency > 64) {
            throw new Error("PWRC_RELAYER_CONCURRENCY_INVALID");
        }
        this.#maxConcurrency = maxConcurrency;
    }
    get active() { return this.#active; }
    get queued() { return this.#waiters.length; }
    async run(fn) {
        await this.#acquire();
        try {
            return await fn();
        }
        finally {
            this.#release();
        }
    }
    async #acquire() {
        if (this.#active < this.#maxConcurrency) {
            this.#active += 1;
            return;
        }
        await new Promise((resolve) => this.#waiters.push(resolve));
        this.#active += 1;
    }
    #release() {
        this.#active -= 1;
        const next = this.#waiters.shift();
        if (next)
            next();
    }
}
//# sourceMappingURL=concurrency.js.map