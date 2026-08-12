import test from "node:test";
import assert from "node:assert/strict";
import {
  assertProviderAgreement,
  assertSlippageBps,
  assertTradeLiquidity,
  bpsDifference,
} from "../src/market/risk.js";
import { buildQuoteId, assertPwrcTradeQuote } from "../src/market/quote.js";
import { MarketCircuitBreaker } from "../client/market/circuit-breaker.js";

test("provider divergence is measured in basis points", () => {
  assert.equal(Math.round(bpsDifference(1, 1.05)), 500);
});

test("large provider divergence is rejected", () => {
  const now = Math.floor(Date.now() / 1000);
  assert.throws(
    () => assertProviderAgreement(
      { source: "pyth", usd: 1, observedAt: now, confidenceUsd: 0.001 },
      { source: "birdeye", usd: 1.2, observedAt: now },
    ),
    /MARKET_PROVIDER_DIVERGENCE/,
  );
});

test("liquidity and slippage limits fail closed", () => {
  assert.throws(() => assertTradeLiquidity(9999), /PWRC_MARKET_LIQUIDITY_TOO_LOW/);
  assert.throws(() => assertSlippageBps(501), /PWRC_SLIPPAGE_TOO_HIGH/);
});

test("quote fingerprint and expiry are verified", () => {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = {
    version: "1.0.0" as const,
    inputMint: "input",
    outputMint: "output",
    inputAmountBaseUnits: "1000000000",
    minimumOutputBaseUnits: "950000000",
    slippageBps: 500,
    issuedAt: now,
    expiresAt: now + 30,
    route: "test",
  };
  const quote = { ...unsigned, quoteId: buildQuoteId(unsigned) };
  assert.doesNotThrow(() => assertPwrcTradeQuote(quote, now));
});

test("market circuit breaker blocks until cooldown", () => {
  const breaker = new MarketCircuitBreaker(60);
  breaker.trip(1000);
  assert.throws(() => breaker.assertClosed(1010), /PWRC_MARKET_CIRCUIT_BREAKER_OPEN/);
  assert.doesNotThrow(() => breaker.assertClosed(1060));
});
