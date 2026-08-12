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

export const PWRC_MARKET_RISK_POLICY: MarketRiskPolicy = {
  maxAgeSeconds: 60,
  maxPythConfidenceBps: 500,
  maxProviderDivergenceBps: 750,
  maxQuoteSlippageBps: 500,
  minLiquidityUsd: 10_000,
  circuitBreakerCooldownSeconds: 60,
};

function assertFinitePositive(value: number, code: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new Error(code);
}

export function bpsDifference(a: number, b: number): number {
  assertFinitePositive(a, "MARKET_PRICE_A_INVALID");
  assertFinitePositive(b, "MARKET_PRICE_B_INVALID");
  return Math.abs(a - b) / Math.min(a, b) * 10_000;
}

export function assertFreshObservation(
  observation: PriceObservation,
  now = Math.floor(Date.now() / 1000),
  policy = PWRC_MARKET_RISK_POLICY,
): void {
  assertFinitePositive(observation.usd, "MARKET_PRICE_INVALID");
  if (observation.observedAt > now + 30) throw new Error("MARKET_PRICE_FROM_FUTURE");
  if (now - observation.observedAt > policy.maxAgeSeconds) throw new Error("MARKET_PRICE_STALE");

  if (observation.source === "pyth" && observation.confidenceUsd !== undefined) {
    if (!Number.isFinite(observation.confidenceUsd) || observation.confidenceUsd < 0) {
      throw new Error("PYTH_CONFIDENCE_INVALID");
    }
    const confidenceBps = observation.confidenceUsd / observation.usd * 10_000;
    if (confidenceBps > policy.maxPythConfidenceBps) {
      throw new Error("PYTH_CONFIDENCE_TOO_WIDE");
    }
  }
}

export function assertProviderAgreement(
  primary: PriceObservation,
  secondary: PriceObservation,
  policy = PWRC_MARKET_RISK_POLICY,
): void {
  assertFreshObservation(primary, undefined, policy);
  assertFreshObservation(secondary, undefined, policy);
  if (bpsDifference(primary.usd, secondary.usd) > policy.maxProviderDivergenceBps) {
    throw new Error("MARKET_PROVIDER_DIVERGENCE");
  }
}

export function assertTradeLiquidity(
  liquidityUsd: number,
  policy = PWRC_MARKET_RISK_POLICY,
): void {
  if (!Number.isFinite(liquidityUsd) || liquidityUsd < policy.minLiquidityUsd) {
    throw new Error("PWRC_MARKET_LIQUIDITY_TOO_LOW");
  }
}

export function assertSlippageBps(
  slippageBps: number,
  policy = PWRC_MARKET_RISK_POLICY,
): void {
  if (!Number.isInteger(slippageBps) || slippageBps < 0) throw new Error("PWRC_SLIPPAGE_INVALID");
  if (slippageBps > policy.maxQuoteSlippageBps) throw new Error("PWRC_SLIPPAGE_TOO_HIGH");
}
