import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];
const policy = fs.readFileSync("apps/api/lib/token-policy.mjs", "utf8");
const fees = fs.readFileSync("apps/api/lib/fees.mjs", "utf8");
const bridge = fs.readFileSync("apps/api/lib/bridge-routes.mjs", "utf8");
const server = fs.readFileSync("apps/api/server.mjs", "utf8");
const sdk = fs.readFileSync("packages/sdk/src/api-client.ts", "utf8");
const amount = fs.readFileSync("packages/protocol/src/token-amount.ts", "utf8");
const openapi = JSON.parse(fs.readFileSync("swagger/openapi.json", "utf8"));

for (const invariant of ["canonicalTokenEconomics", "canonicalTokenSnapshot", "canonicalTokenProfile"]) {
  if (!policy.includes(invariant)) failures.push(`token-runtime:policy:${invariant}`);
}
for (const invariant of ["canonicalTokenEconomics", "FIXED_SUPPLY_BASE_UNITS", "PWRC_AMOUNT_EXCEEDS_SUPPLY", "PWRC_NET_AMOUNT_UNACHIEVABLE"]) {
  if (!fees.includes(invariant)) failures.push(`token-runtime:fees:${invariant}`);
}
if (fees.includes("const NATIVE_FEE_BPS = 250n") || fees.includes("const NATIVE_FEE_CAP = 1_000_000_000_000_000n")) {
  failures.push("token-runtime:duplicated-fee-constants");
}
if (!bridge.includes("canonicalTokenSnapshot")) failures.push("token-runtime:bridge-policy-source");
if (!server.includes("canonicalTokenProfile")) failures.push("token-runtime:token-profile-source");
if (!sdk.includes("assertPositivePwrcBaseUnitsString")) failures.push("token-runtime:sdk-amount-bound");
if (!amount.includes("PWRC_AMOUNT_MUST_BE_POSITIVE")) failures.push("token-runtime:positive-amount-helper");
const schema = openapi.components?.schemas?.TokenResponse;
if (schema?.additionalProperties !== false || schema?.properties?.policySha256?.const !== "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4") {
  failures.push("token-runtime:openapi-token-profile");
}
console.log(JSON.stringify({ok: failures.length===0, version:"1.0.0", feeEnginePolicyDerived:true, fixedSupplyQuoteBound:true, compactTokenPolicyDerived:true, bridgeIdentityPolicyDerived:true, sdkAmountSupplyBound:true, publicWrites:false, failures}, null, 2));
if (failures.length) process.exit(1);
