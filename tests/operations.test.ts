import test from "node:test";
import assert from "node:assert/strict";
import {
  assertOperationAmount,
  operationRule,
} from "../packages/protocol/src/operations/policy.js";
import {
  canonicalMarketId,
  canonicalServiceId,
} from "../packages/protocol/src/operations/ids.js";

test("signed messages do not require token value", () => {
  assert.doesNotThrow(() => assertOperationAmount("signed-message"));
  assert.doesNotThrow(() => assertOperationAmount("authentication", 0n));
  assert.equal(operationRule("signed-message").zeroAmountAllowed, true);
});

test("market discovery and quote preview permit zero monetary value", () => {
  assert.doesNotThrow(() => assertOperationAmount("market-discovery", 0n));
  assert.doesNotThrow(() => assertOperationAmount("market-data"));
  assert.doesNotThrow(() => assertOperationAmount("quote-preview", 0n));
});

test("settlement operations require positive amounts", () => {
  for (const op of [
    "transfer",
    "swap-settlement",
    "fee-settlement",
    "bridge-settlement",
    "x402-settlement",
    "checkout-settlement",
  ] as const) {
    assert.throws(() => assertOperationAmount(op, 0n), /ZERO_AMOUNT/);
    assert.doesNotThrow(() => assertOperationAmount(op, 1n));
  }
});

test("market IDs are canonical and amount-independent", () => {
  assert.equal(
    canonicalMarketId({
      version: "1.0.0",
      provider: "pyth",
      network: "solana",
      baseAsset: "PWRC",
      quoteAsset: "USD",
    }),
    "market:pyth:solana:PWRC/USD",
  );
});

test("service IDs are deterministic", () => {
  assert.equal(
    canonicalServiceId({
      version: "1.0.0",
      kind: "ai-compute",
      id: "inference",
      network: "solana",
    }),
    "service:ai-compute:inference:solana",
  );
});
