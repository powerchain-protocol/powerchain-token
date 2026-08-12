import fs from "node:fs";
const failures = [];
for (const file of [
  "docs/OPERATIONS.md",
  "docs/MAINNET_CHECKLIST.md",
  "docs/DEVNET.md",
  "config/operations/policy.json",
  "config/runtime.json",
  "config/transactions.json",
]) {
  if (!fs.existsSync(file)) failures.push(`missing:${file}`);
}
console.log(JSON.stringify({ ok: failures.length === 0, version: "1.0.0", failures }, null, 2));
if (failures.length) process.exit(1);
