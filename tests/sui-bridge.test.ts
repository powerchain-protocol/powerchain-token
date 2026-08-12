import test from "node:test";
import assert from "node:assert/strict";
import {
  WPWRC_DECIMALS,
  WPWRC_MAX_BASE_UNITS,
  bridgeMessageHash,
} from "../client/sui/wpwrc.js";

test("wPWRC matches canonical PWRC precision and maximum", () => {
  assert.equal(WPWRC_DECIMALS, 9);
  assert.equal(WPWRC_MAX_BASE_UNITS, 18_446_000_000_000_000_000n);
});

test("Solana source event hashes are deterministic 32-byte bridge IDs", () => {
  const a = bridgeMessageHash({
    sourceChain: "solana",
    cluster: "devnet",
    signature: "example-signature",
    instructionIndex: 0,
  });
  const b = bridgeMessageHash({
    sourceChain: "solana",
    cluster: "devnet",
    signature: "example-signature",
    instructionIndex: 0,
  });
  assert.equal(a.length, 32);
  assert.deepEqual(a, b);
});
