import test from "node:test";
import assert from "node:assert/strict";
import {
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_TOKENS,
  PWRC_TRANSFER_FEE_BPS,
} from "../packages/protocol/src/constants.js";

test("PWRC uses native Token-2022 fee policy, not a custom fee collector", () => {
  assert.equal(PWRC_TRANSFER_FEE_BPS, 250n);
  assert.equal(PWRC_MAX_TRANSFER_FEE_TOKENS, 1_000_000n);
  assert.equal(PWRC_MAX_TRANSFER_FEE_BASE_UNITS, 1_000_000_000_000_000n);
});
