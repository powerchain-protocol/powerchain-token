import fs from "node:fs";
const failures = [];
for (const file of [
  "config/runtime.json",
  "config/transactions.json",
  "config/handlers.json",
  "config/production/policy.json",
  "config/devnet/bridge.json",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (data.version !== "1.0.0") failures.push(`version:${file}`);
}
const tx = JSON.parse(fs.readFileSync("config/transactions.json", "utf8"));
if (tx.policy.blindWriteRetries !== false) failures.push("transactions:blind-write-retries");
if (tx.fee.basisPoints !== 250) failures.push("transactions:fee-bps");
if (tx.fee.maximumFeeTokens !== "1000000") failures.push("transactions:fee-cap");
const prod = JSON.parse(fs.readFileSync("config/production/policy.json", "utf8"));
if (prod.mainnetFailClosed !== true) failures.push("production:fail-closed");
console.log(JSON.stringify({ ok: failures.length === 0, version: "1.0.0", failures }, null, 2));
if (failures.length) process.exit(1);
