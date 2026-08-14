import test from "node:test";
import assert from "node:assert/strict";
import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_TRANSFER_FEE_BPS,
  WPWRC_DECIMALS,
} from "../packages/protocol/src/index.js";

test("canonical PWRC profile",()=>{
  assert.equal(PWRC_CANONICAL_MINT,"PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc");
  assert.equal(PWRC_DECIMALS,9);
  assert.equal(PWRC_GENESIS_BASE_UNITS,18_446_000_000_000_000_000n);
  assert.equal(PWRC_TRANSFER_FEE_BPS,250n);
  assert.equal(WPWRC_DECIMALS,9);
});
