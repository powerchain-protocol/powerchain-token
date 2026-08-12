import test from "node:test";
import assert from "node:assert/strict";
import { Keypair } from "@solana/web3.js";
import {
  findPwrcBridgeConfigPda,
  findPwrcLockReceiptPda,
  findPwrcReleaseReceiptPda,
  findPwrcVaultAuthorityPda,
  PWRC_LOCK_PROGRAM_ID,
  PWRC_TOKEN_VERIFIER_PROGRAM_ID,
} from "../client/programs.js";

test("active PowerChain local program identities are valid and distinct", () => {
  assert.notEqual(PWRC_LOCK_PROGRAM_ID.toBase58(), PWRC_TOKEN_VERIFIER_PROGRAM_ID.toBase58());
  assert.equal(PWRC_LOCK_PROGRAM_ID.toBytes().length, 32);
  assert.equal(PWRC_TOKEN_VERIFIER_PROGRAM_ID.toBytes().length, 32);
});

test("bridge PDAs are deterministic and domain-separated", () => {
  const mint = Keypair.generate().publicKey;
  const [config] = findPwrcBridgeConfigPda(mint);
  const [vaultAuthority] = findPwrcVaultAuthorityPda(mint);
  const id = new Uint8Array(32).fill(7);
  const [lock] = findPwrcLockReceiptPda(config, id);
  const [release] = findPwrcReleaseReceiptPda(config, id);
  assert.notEqual(config.toBase58(), vaultAuthority.toBase58());
  assert.notEqual(lock.toBase58(), release.toBase58());
});
