export class MarketCircuitBreaker {
  private openedAt: number | null = null;

  constructor(readonly cooldownSeconds = 60) {}

  trip(now = Math.floor(Date.now() / 1000)): void {
    this.openedAt = now;
  }

  reset(): void {
    this.openedAt = null;
  }

  assertClosed(now = Math.floor(Date.now() / 1000)): void {
    if (this.openedAt === null) return;
    if (now - this.openedAt >= this.cooldownSeconds) {
      this.openedAt = null;
      return;
    }
    throw new Error("PWRC_MARKET_CIRCUIT_BREAKER_OPEN");
  }

  get isOpen(): boolean {
    return this.openedAt !== null;
  }
}
