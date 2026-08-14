import test from "node:test";
import assert from "node:assert/strict";
import { nativePwrcTransferFee, quoteFees } from "../packages/protocol/src/fees.js";

test("native PWRC fee is 250 bps",()=>{
  assert.equal(nativePwrcTransferFee(1_000n*1_000_000_000n),25n*1_000_000_000n);
});

test("native PWRC fee cap is 1,000,000 PWRC",()=>{
  assert.equal(nativePwrcTransferFee(100_000_000n*1_000_000_000n),1_000_000n*1_000_000_000n);
});

test("wallet transfers do not receive service fee",()=>{
  const q=quoteFees({
    operation:"wallet-transfer",
    principalGrossBaseUnits:1_000n*1_000_000_000n,
    serviceFee:{enabled:true,basisPoints:250n,recipient:"11111111111111111111111111111111"}
  });
  assert.equal(q.serviceFeeEnabled,false);
  assert.equal(q.serviceFeeNetBaseUnits,0n);
});

test("bridge service fee is separate and grossed up",()=>{
  const q=quoteFees({
    operation:"bridge-solana-to-sui",
    principalGrossBaseUnits:1_000n*1_000_000_000n,
    serviceFee:{enabled:true,basisPoints:250n,recipient:"11111111111111111111111111111111"}
  });
  assert.equal(q.serviceFeeEnabled,true);
  assert.equal(q.serviceFeeNetBaseUnits,25n*1_000_000_000n);
  assert.ok(q.serviceFeeGrossTransferBaseUnits>q.serviceFeeNetBaseUnits);
  assert.equal(q.totalWalletPwrcDebitBaseUnits, q.principalGrossBaseUnits+q.serviceFeeGrossTransferBaseUnits);
});
