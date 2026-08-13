import test from "node:test";
import assert from "node:assert/strict";
import { formatBaseUnits, toBaseUnits } from "../packages/protocol/src/amounts.js";

test("whole PWRC to base units", () => {
  assert.equal(toBaseUnits(1n), 1_000_000_000n);
});

test("format raw units deterministically", () => {
  assert.equal(formatBaseUnits(1_000_000_001n), "1.000000001");
});
