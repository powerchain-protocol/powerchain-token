import test from "node:test";
import assert from "node:assert/strict";
import {
  solanaPwrcLockClaimHash,
} from "../packages/sdk/src/sui/wpwrc.js";
import { verifyCrossChainSupply } from "../packages/protocol/src/sui-bridge-integrity.js";

const claim = {
  version: "1.0.0" as const,
  sourceChain: "solana" as const,
  cluster: "devnet" as const,
  canonicalMint: "CanonicalMint",
  lockVault: "LockVault",
  signature: "TransactionSignature",
  instructionIndex: 2,
  amountBaseUnits: 1_000_000_000n,
  suiRecipient: "0x1234",
};

test("Sui mint claim hash binds amount", () => {
  const a = solanaPwrcLockClaimHash(claim);
  const b = solanaPwrcLockClaimHash({
    ...claim,
    amountBaseUnits: claim.amountBaseUnits + 1n,
  });
  assert.notDeepEqual(a, b);
});

test("Sui mint claim hash binds recipient", () => {
  const a = solanaPwrcLockClaimHash(claim);
  const b = solanaPwrcLockClaimHash({
    ...claim,
    suiRecipient: "0x5678",
  });
  assert.notDeepEqual(a, b);
});

test("cross-chain conservation rejects under-backed wPWRC", () => {
  const evidence = verifyCrossChainSupply({
    version: "1.0.0",
    solanaLockedBaseUnits: 100n,
    suiWrappedSupplyBaseUnits: 101n,
    pendingSolanaToSuiBaseUnits: 0n,
    pendingSuiToSolanaBaseUnits: 0n,
    solanaSlot: 1n,
    suiCheckpoint: 1n,
    observedAt: "2026-08-12T00:00:00Z",
  });
  assert.equal(evidence.valid, false);
  assert.ok(evidence.errors.includes("WRAPPED_EXPOSURE_EXCEEDS_LOCKED_PWRC"));
});

test("cross-chain conservation accepts exactly backed exposure", () => {
  const evidence = verifyCrossChainSupply({
    version: "1.0.0",
    solanaLockedBaseUnits: 100n,
    suiWrappedSupplyBaseUnits: 90n,
    pendingSolanaToSuiBaseUnits: 10n,
    pendingSuiToSolanaBaseUnits: 0n,
    solanaSlot: 1n,
    suiCheckpoint: 1n,
    observedAt: "2026-08-12T00:00:00Z",
  });
  assert.equal(evidence.valid, true);
  assert.equal(evidence.backingSurplusBaseUnits, 0n);
});
