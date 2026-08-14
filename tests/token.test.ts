import test from "node:test";
import assert from "node:assert/strict";
import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_TRANSFER_FEE_BPS,
  POWERCHAIN_TRANSACTION_FEE_SOLANA,
  POWERCHAIN_TRANSACTION_FEE_SUI,
  PWRC_TOKEN_VERIFIER_PROGRAM_ID,
  WPWRC_DECIMALS,
} from "../packages/protocol/src/index.js";

test("canonical PWRC profile",()=>{
  assert.equal(PWRC_CANONICAL_MINT,"PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc");
  assert.equal(PWRC_DECIMALS,9);
  assert.equal(PWRC_GENESIS_BASE_UNITS,18_446_000_000_000_000_000n);
  assert.equal(PWRC_TRANSFER_FEE_BPS,250n);
  assert.equal(WPWRC_DECIMALS,9);
});

test("canonical program and service fee recipients",()=>{
  assert.equal(
    PWRC_TOKEN_VERIFIER_PROGRAM_ID,
    "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu",
  );
  assert.equal(
    POWERCHAIN_TRANSACTION_FEE_SOLANA,
    "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy",
  );
  assert.equal(
    POWERCHAIN_TRANSACTION_FEE_SUI,
    "0xc23c9622a09c5533fd18f35703622dc2df44206749a1761202d2024a04a36f50",
  );
});
