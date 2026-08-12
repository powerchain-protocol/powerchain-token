import test from "node:test";
import assert from "node:assert/strict";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  buildPwrcFeeTransferInstruction,
  findPwrcFeeConfigPda,
  PWRC_FEES_PROGRAM_ID,
} from "../client/programs.js";

const TOKEN_2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

test("fee config PDA is deterministic", () => {
  const mint = Keypair.generate().publicKey;
  const a = findPwrcFeeConfigPda(mint);
  const b = findPwrcFeeConfigPda(mint);
  assert.equal(a[0].toBase58(), b[0].toBase58());
  assert.equal(a[1], b[1]);
});

test("fee transfer instruction uses expected accounts and program", () => {
  const owner = Keypair.generate().publicKey;
  const source = Keypair.generate().publicKey;
  const destination = Keypair.generate().publicKey;
  const feeVault = Keypair.generate().publicKey;
  const mint = Keypair.generate().publicKey;

  const ix = buildPwrcFeeTransferInstruction({
    owner,
    source,
    destination,
    feeVault,
    mint,
    tokenProgram: TOKEN_2022,
    grossAmountBaseUnits: 1_000_000_000n,
  });

  assert.equal(ix.programId.toBase58(), PWRC_FEES_PROGRAM_ID.toBase58());
  assert.equal(ix.keys.length, 7);
  assert.equal(ix.keys[0]?.isSigner, true);
  assert.equal(ix.data.length, 16);
});
