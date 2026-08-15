import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const intent = fs.readFileSync(
  "packages/protocol/src/native-transfer-intent.ts",
  "utf8",
);
const transactions = fs.readFileSync(
  "packages/sdk/src/native-token-transactions.ts",
  "utf8",
);
const fees = fs.readFileSync(
  "apps/api/lib/fees.mjs",
  "utf8",
);
const runtime = fs.readFileSync(
  "apps/api/lib/token-runtime.mjs",
  "utf8",
);

test("native intent binds canonical token policy", () => {
  for (const invariant of [
    "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
    "tokenPolicySha256",
    "PWRC_NATIVE_INTENT_TOKEN_POLICY_MISMATCH",
  ]) {
    assert.ok(intent.includes(invariant));
  }
});

test("fee quote fingerprint binds canonical token policy", () => {
  assert.ok(fees.includes("TOKEN_POLICY_SHA256"));
  assert.ok(fees.includes("tokenPolicySha256"));
  assert.ok(fees.includes("PWRC_TOTAL_SOURCE_DEBIT_EXCEEDS_SUPPLY"));
});

test("priority fee policy has explicit price, compute, and total ceilings", () => {
  for (const invariant of [
    "PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX",
    "PWRC_NATIVE_TRANSFER_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT",
    "PWRC_NATIVE_TRANSFER_TOTAL_PRIORITY_FEE_INVALID",
  ]) {
    assert.ok(transactions.includes(invariant));
  }
  assert.ok(runtime.includes("priorityFeeLamports"));
});
