import fs from "node:fs";
const failures = [];
const tx = fs.readFileSync("packages/sdk/src/transactions.ts", "utf8");
for (const token of [
  "createTransferCheckedWithFeeInstruction",
  "maxRetries: 0",
  "confirmTransaction",
  "reconcilePwrcTransferSignature",
  "PWRC_CANONICAL_MINT_ADDRESS_MISMATCH",
]) {
  if (!tx.includes(token)) failures.push(`transactions:${token}`);
}
if (tx.includes("buildPwrcFeeTransferInstruction")) failures.push("transactions:deprecated-fee-router");
console.log(JSON.stringify({ ok: failures.length === 0, version: "1.0.0", failures }, null, 2));
if (failures.length) process.exit(1);
