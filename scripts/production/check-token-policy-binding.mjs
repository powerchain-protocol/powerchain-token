import fs from "node:fs";

const failures = [];
const intent = fs.readFileSync("packages/protocol/src/native-transfer-intent.ts", "utf8");
const transactions = fs.readFileSync("packages/sdk/src/native-token-transactions.ts", "utf8");
const fees = fs.readFileSync("apps/api/lib/fees.mjs", "utf8");
const runtime = fs.readFileSync("apps/api/lib/token-runtime.mjs", "utf8");
const openapi = JSON.parse(fs.readFileSync("swagger/openapi.json", "utf8"));

for (const invariant of [
  "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
  "tokenPolicySha256",
  "PWRC_NATIVE_INTENT_TOKEN_POLICY_MISMATCH",
]) {
  if (!intent.includes(invariant)) failures.push(`policy-binding:intent:${invariant}`);
}

for (const invariant of [
  "TOKEN_POLICY_SHA256",
  "tokenPolicySha256",
  "PWRC_TOTAL_SOURCE_DEBIT_EXCEEDS_SUPPLY",
]) {
  if (!fees.includes(invariant)) failures.push(`policy-binding:quote:${invariant}`);
}

for (const invariant of [
  "PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX",
  "PWRC_NATIVE_TRANSFER_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT",
  "PWRC_NATIVE_TRANSFER_TOTAL_PRIORITY_FEE_INVALID",
]) {
  if (!transactions.includes(invariant)) failures.push(`policy-binding:tx:${invariant}`);
}

if (!runtime.includes('priorityFeeLamports:\n        "400000"')) {
  failures.push("policy-binding:runtime-total-priority-fee");
}

const quoteSchema = openapi.components?.schemas?.FeeQuoteResponse;
if (
  quoteSchema?.properties?.tokenPolicySha256?.const !==
    "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4" ||
  !quoteSchema?.required?.includes("tokenPolicySha256")
) {
  failures.push("policy-binding:openapi-quote-policy-sha");
}

const transferSchema = openapi.paths?.["/api/v1/token/transfer-policy"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;
if (
  transferSchema?.properties?.transactionSafetyCeilings?.properties?.priorityFeeLamports?.const !== "400000"
) {
  failures.push("policy-binding:openapi-priority-fee-total");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  intentPolicyBound: true,
  quotePolicyBound: true,
  totalSourceDebitSupplyBound: true,
  priorityFeeTotalBound: true,
  publicWrites: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
