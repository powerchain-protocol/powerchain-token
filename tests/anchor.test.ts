import test from "node:test";
import assert from "node:assert/strict";
import * as anchor from "@coral-xyz/anchor";
import axios from "axios";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import {
  PWRCClient,
  assertSolanaSignature,
  decodeSecretKey,
  resolveRpcUrl,
  walletFromKeypair,
} from "../packages/sdk/src/client.js";
import {
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_GENESIS_SUPPLY,
} from "../packages/protocol/src/constants.js";

test("Anchor compatibility client initializes without network I/O", () => {
  const keypair = Keypair.generate();
  const wallet = walletFromKeypair(keypair);
  const client = new PWRCClient({
    cluster: "localnet",
    rpcUrl: "http://127.0.0.1:8899",
    wallet,
  });

  assert.ok(client.provider instanceof anchor.AnchorProvider);
  assert.equal(client.provider.wallet.publicKey.toBase58(), keypair.publicKey.toBase58());
  assert.equal(client.rpcUrl, "http://127.0.0.1:8899");
});

test("bs58 signer decoding round-trips a Solana keypair", () => {
  const keypair = Keypair.generate();
  const encoded = bs58.encode(keypair.secretKey);
  const decoded = decodeSecretKey(encoded);
  const restored = Keypair.fromSecretKey(decoded);
  assert.equal(restored.publicKey.toBase58(), keypair.publicKey.toBase58());
});

test("JSON signer decoding is supported without writing secrets", () => {
  const keypair = Keypair.generate();
  const decoded = decodeSecretKey(JSON.stringify(Array.from(keypair.secretKey)));
  assert.deepEqual(Array.from(decoded), Array.from(keypair.secretKey));
});

test("client dependencies and canonical PWRC constants are wired", () => {
  assert.equal(typeof axios.create, "function");
  assert.equal(typeof bs58.encode, "function");
  assert.equal(PWRC_DECIMALS, 9);
  assert.equal(PWRC_GENESIS_SUPPLY, 18_446_000_000n);
  assert.equal(PWRC_GENESIS_BASE_UNITS, 18_446_000_000_000_000_000n);
  assert.equal(resolveRpcUrl("devnet"), "https://api.devnet.solana.com");
});


test("mainnet RPC requires HTTPS", () => {
  assert.throws(
    () => resolveRpcUrl("mainnet-beta", "http://example.com"),
    /POWERCHAIN_HTTPS_REQUIRED/,
  );
});

test("Solana transaction signatures are validated as 64-byte base58", () => {
  const valid = bs58.encode(new Uint8Array(64).fill(7));
  assert.doesNotThrow(() => assertSolanaSignature(valid));
  assert.throws(() => assertSolanaSignature(bs58.encode(new Uint8Array(32))), /PWRC_INVALID_SIGNATURE_LENGTH/);
});
