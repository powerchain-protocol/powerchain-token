import test from "node:test";
import assert from "node:assert/strict";
import {
  pwrcSolanaLockClaimHash,
} from "../client/bridge/lock-claim.js";

test("Solana lock claim binds amount and Sui recipient", () => {
  const base = {
    version: "1.0.0" as const,
    cluster: "devnet" as const,
    lockProgramId: "program",
    bridgeConfig: "config",
    lockReceipt: "receipt",
    canonicalMint: "mint",
    vault: "vault",
    transactionSignature: "signature",
    instructionIndex: 0,
    slot: "100",
    transferIdHex: "ab".repeat(32),
    amountBaseUnits: "1000000000",
    suiRecipient:
      "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1",
  };

  const a = pwrcSolanaLockClaimHash(base);
  const b = pwrcSolanaLockClaimHash({
    ...base,
    amountBaseUnits: "1000000001",
  });
  const c = pwrcSolanaLockClaimHash({
    ...base,
    suiRecipient:
      "0x0000000000000000000000000000000000000000000000000000000000000001",
  });

  assert.notEqual(a, b);
  assert.notEqual(a, c);
});
