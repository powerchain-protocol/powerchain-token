import test from "node:test";
import assert from "node:assert/strict";
import { calculateProtocolFeeBaseUnits, splitProtocolFee } from "../src/fees.js";

test("250 bps equals 2.5 percent at 9 decimals", () => {
  const onePwrc = 1_000_000_000n;
  assert.equal(calculateProtocolFeeBaseUnits(onePwrc), 25_000_000n);
});

test("fee split preserves gross amount", () => {
  const gross = 100_000_000_000n;
  const split = splitProtocolFee(gross);
  assert.equal(split.feeBaseUnits, 2_500_000_000n);
  assert.equal(split.netBaseUnits, 97_500_000_000n);
  assert.equal(split.netBaseUnits + split.feeBaseUnits, gross);
});
