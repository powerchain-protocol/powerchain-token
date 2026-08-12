import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateProtocolFeeBaseUnits,
  calculateToken2022TransferFeeBaseUnits,
  quoteToken2022TransferFee,
} from "../src/fees.js";

test("Token-2022 PWRC transfer fee is 250 bps with ceil rounding", () => {
  assert.equal(
    calculateToken2022TransferFeeBaseUnits(
      1_000_000_000n,
    ),
    25_000_000n,
  );

  assert.equal(
    calculateToken2022TransferFeeBaseUnits(1n),
    1n,
  );
});

test("Token-2022 fee is capped at 1,000,000 PWRC", () => {
  assert.equal(
    calculateToken2022TransferFeeBaseUnits(
      100_000_000n * 1_000_000_000n,
    ),
    1000000000000000n,
  );
});

test("no second custom protocol-router fee is charged", () => {
  assert.equal(
    calculateProtocolFeeBaseUnits(
      1_000_000_000n,
    ),
    0n,
  );
});

test("fee quote exposes gross, fee, and net", () => {
  assert.deepEqual(
    quoteToken2022TransferFee(
      1_000_000_000n,
    ),
    {
      grossBaseUnits: 1_000_000_000n,
      feeBaseUnits: 25_000_000n,
      netBaseUnits: 975_000_000n,
      basisPoints: 250,
      percentage: "2.5%",
      maximumFeeBaseUnits:
        1000000000000000n,
    },
  );
});
