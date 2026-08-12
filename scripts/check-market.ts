import fs from "node:fs";

const token = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
const market = JSON.parse(fs.readFileSync("config/integrations/market-data.json", "utf8"));

const errors: string[] = [];

if (token.decimals !== 9) errors.push("token.decimals");
if (token.tradeable !== true) errors.push("token.tradeable");
if (token.zeroAmountTransactionsAllowed !== false) errors.push("token.zeroAmountTransactionsAllowed");
if (token.minimumTransactionBaseUnits !== "1") errors.push("token.minimumTransactionBaseUnits");

if (market.tradeable !== true) errors.push("market.tradeable");
if (market.zeroAmountTransactionsAllowed !== false) errors.push("market.zeroAmountTransactionsAllowed");
if (market.providers?.pyth?.enabled !== true) errors.push("market.pyth");
if (market.providers?.birdeye?.enabled !== true) errors.push("market.birdeye");
if (market.riskControls?.maxPriceAgeSeconds !== 60) errors.push("market.maxPriceAgeSeconds");
if (market.riskControls?.maxQuoteSlippageBps !== 500) errors.push("market.maxQuoteSlippageBps");
if (market.riskControls?.requireNonZeroAmounts !== true) errors.push("market.requireNonZeroAmounts");
if (market.riskControls?.settlementUsesBigInt !== true) errors.push("market.settlementUsesBigInt");

for (const [key, value] of Object.entries(market.tokenRestrictions ?? {})) {
  if (value !== false) errors.push(`market.restriction.${key}`);
}

if (errors.length) throw new Error(`PWRC market policy invalid: ${errors.join(", ")}`);
console.log("PWRC MARKET / TRADEABILITY POLICY PASS");
