import fs from "node:fs";

const token = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
const ops = JSON.parse(fs.readFileSync("config/operations/policy.json", "utf8"));
const markets = JSON.parse(fs.readFileSync("config/integrations/markets.json", "utf8"));

const errors: string[] = [];

if (ops.version !== "1.0.0") errors.push("ops.version");
if (!ops.zeroAmount.allowedFor.includes("signed-message")) errors.push("signed-message");
if (!ops.zeroAmount.allowedFor.includes("market-data")) errors.push("market-data");
if (!ops.zeroAmount.forbiddenFor.includes("transfer")) errors.push("transfer");
if (!ops.zeroAmount.forbiddenFor.includes("swap-settlement")) errors.push("swap-settlement");

if (token.operationPolicy?.zeroValueSettlementAllowed !== false) {
  errors.push("token.zeroValueSettlement");
}
if (token.operationPolicy?.zeroAmountNonSettlementOperationsAllowed !== true) {
  errors.push("token.nonSettlementZero");
}
if (token.operationPolicy?.signedMessagesAllowedWithoutTokenTransfer !== true) {
  errors.push("token.signedMessage");
}

if (markets.canonicalAsset !== "PWRC") errors.push("markets.asset");
if (markets.network !== "solana") errors.push("markets.network");

if (errors.length) {
  throw new Error(`PWRC operation policy invalid: ${errors.join(", ")}`);
}

console.log("PWRC OPERATION POLICY PASS");
