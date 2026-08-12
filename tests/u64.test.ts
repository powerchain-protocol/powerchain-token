import test from "node:test";
import assert from "node:assert/strict";
import { PWRC_GENESIS_BASE_UNITS, U64_MAX } from "../src/constants.js";
test("PWRC raw genesis supply fits u64", () => {
  assert.ok(PWRC_GENESIS_BASE_UNITS <= U64_MAX);
  assert.equal(U64_MAX - PWRC_GENESIS_BASE_UNITS, 744_073_709_551_615n);
});
