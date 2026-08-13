export declare class MarketCircuitBreaker {
    readonly cooldownSeconds: number;
    private openedAt;
    constructor(cooldownSeconds?: number);
    trip(now?: number): void;
    reset(): void;
    assertClosed(now?: number): void;
    get isOpen(): boolean;
}
//# sourceMappingURL=circuit-breaker.d.ts.map