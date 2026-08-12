import test from "node:test";
import assert from "node:assert/strict";
import {
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_GENESIS_SUPPLY,
  U64_MAX,
} from "../src/constants.js";

test("PWRC canonical monetary policy", () => {
  assert.equal(PWRC_DECIMALS, 9);
  assert.equal(PWRC_GENESIS_SUPPLY, 18_446_000_000n);
  assert.equal(PWRC_GENESIS_BASE_UNITS, 18_446_000_000_000_000_000n);
  assert.ok(PWRC_GENESIS_BASE_UNITS <= U64_MAX);
});
