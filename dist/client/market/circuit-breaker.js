export class MarketCircuitBreaker {
    cooldownSeconds;
    openedAt = null;
    constructor(cooldownSeconds = 60) {
        this.cooldownSeconds = cooldownSeconds;
    }
    trip(now = Math.floor(Date.now() / 1000)) {
        this.openedAt = now;
    }
    reset() {
        this.openedAt = null;
    }
    assertClosed(now = Math.floor(Date.now() / 1000)) {
        if (this.openedAt === null)
            return;
        if (now - this.openedAt >= this.cooldownSeconds) {
            this.openedAt = null;
            return;
        }
        throw new Error("PWRC_MARKET_CIRCUIT_BREAKER_OPEN");
    }
    get isOpen() {
        return this.openedAt !== null;
    }
}
//# sourceMappingURL=circuit-breaker.js.map