import test from "node:test";
import assert from "node:assert/strict";
import { PublicKey } from "@solana/web3.js";
import {
  PWRC_FEE_COLLECTOR_OWNER,
  PWRC_PROTOCOL_FEE_BPS,
} from "../src/fees.js";

test("canonical fee collector is a valid Solana public key", () => {
  const key = new PublicKey(PWRC_FEE_COLLECTOR_OWNER);
  assert.equal(key.toBase58(), "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy");
  assert.equal(key.toBytes().length, 32);
});

test("PWRC protocol fee is exactly 250 basis points", () => {
  assert.equal(PWRC_PROTOCOL_FEE_BPS, 250n);
});
