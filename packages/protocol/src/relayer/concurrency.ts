export class BoundedExecutor {
  readonly #maxConcurrency: number;
  #active = 0;
  readonly #waiters: Array<() => void> = [];

  constructor(maxConcurrency = 4) {
    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1 || maxConcurrency > 64) {
      throw new Error("PWRC_RELAYER_CONCURRENCY_INVALID");
    }
    this.#maxConcurrency = maxConcurrency;
  }

  get active(): number { return this.#active; }
  get queued(): number { return this.#waiters.length; }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.#acquire();
    try { return await fn(); }
    finally { this.#release(); }
  }

  async #acquire(): Promise<void> {
    if (this.#active < this.#maxConcurrency) {
      this.#active += 1;
      return;
    }
    await new Promise<void>((resolve) => this.#waiters.push(resolve));
    this.#active += 1;
  }

  #release(): void {
    this.#active -= 1;
    const next = this.#waiters.shift();
    if (next) next();
  }
}
