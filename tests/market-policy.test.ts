import test from "node:test";
import assert from "node:assert/strict";
import {
  assertNonZeroPwrcAmount,
  baseUnitsToUi,
  uiToBaseUnits,
  PWRC_TRADEABILITY_POLICY,
} from "../packages/protocol/src/market/policy.js";

test("zero PWRC transactions are rejected", () => {
  assert.throws(() => assertNonZeroPwrcAmount(0n), /PWRC_ZERO_OR_NEGATIVE_TRANSACTION/);
  assert.throws(() => uiToBaseUnits("0"), /PWRC_ZERO_OR_NEGATIVE_AMOUNT/);
  assert.throws(() => uiToBaseUnits("0.000000000"), /PWRC_ZERO_OR_NEGATIVE_AMOUNT/);
});

test("smallest valid PWRC amount is one base unit", () => {
  assert.equal(uiToBaseUnits("0.000000001"), 1n);
  assert.equal(baseUnitsToUi(1n), "0.000000001");
});

test("PWRC decimals remain exactly 9", () => {
  assert.equal(uiToBaseUnits("1"), 1_000_000_000n);
  assert.equal(uiToBaseUnits("1.123456789"), 1_123_456_789n);
  assert.throws(() => uiToBaseUnits("1.1234567890"), /PWRC_UI_AMOUNT_INVALID/);
});

test("PWRC remains freely transferable for trading", () => {
  assert.equal(PWRC_TRADEABILITY_POLICY.freelyTransferable, true);
  assert.equal(PWRC_TRADEABILITY_POLICY.nonTransferableExtension, false);
  assert.equal(PWRC_TRADEABILITY_POLICY.defaultFrozen, false);
  assert.equal(PWRC_TRADEABILITY_POLICY.transferHookRequired, false);
  assert.equal(PWRC_TRADEABILITY_POLICY.allowlistRequired, false);
});
