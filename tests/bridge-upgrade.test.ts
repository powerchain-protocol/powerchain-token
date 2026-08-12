import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSolanaLockReceiptObservation,
} from "../src/bridge/receipt.js";
import {
  reconcileBridgeBacking,
} from "../src/bridge/reconcile.js";

test("lock receipt requires fee-adjusted wrapped amount", () => {
  assert.doesNotThrow(() =>
    assertSolanaLockReceiptObservation({
      version: 1,
      lockProgramId: "program",
      bridgeConfig: "config",
      receipt: "receipt",
      canonicalMint:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      vault: "vault",
      owner: "owner",
      amountBaseUnits:
        1_000_000_000n,
      wrappedAmountBaseUnits:
        975_000_000n,
      transferIdHex:
        "ab".repeat(32),
      suiRecipient:
        "0x" + "1".repeat(64),
      sequence: 1n,
      slot: 1n,
      transactionSignature: "sig",
      instructionIndex: 0,
    }),
  );
});

test("reconciliation rejects undercollateralization", () => {
  const result =
    reconcileBridgeBacking({
      lockedCanonicalBaseUnits: 999n,
      suiWrappedSupplyBaseUnits: 1_000n,
      pendingSolanaToSuiBaseUnits: 0n,
      pendingSuiToSolanaBaseUnits: 0n,
    });

  assert.equal(result.valid, false);
});
