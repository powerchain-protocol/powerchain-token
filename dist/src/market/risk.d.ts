export interface PriceObservation {
    source: "pyth" | "birdeye";
    usd: number;
    observedAt: number;
    confidenceUsd?: number;
}
export interface MarketRiskPolicy {
    maxAgeSeconds: number;
    maxPythConfidenceBps: number;
    maxProviderDivergenceBps: number;
    maxQuoteSlippageBps: number;
    minLiquidityUsd: number;
    circuitBreakerCooldownSeconds: number;
}
export declare const PWRC_MARKET_RISK_POLICY: MarketRiskPolicy;
export declare function bpsDifference(a: number, b: number): number;
export declare function assertFreshObservation(observation: PriceObservation, now?: number, policy?: MarketRiskPolicy): void;
export declare function assertProviderAgreement(primary: PriceObservation, secondary: PriceObservation, policy?: MarketRiskPolicy): void;
export declare function assertTradeLiquidity(liquidityUsd: number, policy?: MarketRiskPolicy): void;
export declare function assertSlippageBps(slippageBps: number, policy?: MarketRiskPolicy): void;
//# sourceMappingURL=risk.d.ts.map