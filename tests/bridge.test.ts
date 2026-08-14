import test from "node:test";
import assert from "node:assert/strict";
import { quoteSolanaToSuiBridge, assertBridgeConservation } from "../packages/protocol/src/bridge.js";

test("Solana to Sui mints net locked PWRC",()=>{
  const q=quoteSolanaToSuiBridge(1_000n*1_000_000_000n);
  assert.equal(q.wrappedMintBaseUnits,q.canonicalLockedBaseUnits);
  assert.equal(q.nativeTransferFeeBaseUnits,25n*1_000_000_000n);
});

test("bridge rejects undercollateralized wrapped exposure",()=>{
  assert.throws(()=>assertBridgeConservation({
    canonicalLockedBaseUnits:99n,
    wrappedSupplyBaseUnits:100n
  }),/PWRC_BRIDGE_UNDERCOLLATERALIZED/);
});
