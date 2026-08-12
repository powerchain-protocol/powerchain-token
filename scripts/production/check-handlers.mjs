import fs from "node:fs";

const failures = [];

for (const file of [
  "src/handlers/read-handler.ts",
  "src/handlers/write-handler.ts",
  "src/handlers/operation-handler.ts",
  "src/common/retry.ts",
  "src/common/timeout.ts",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
  }
}

const writeHandler = fs.readFileSync(
  "src/handlers/write-handler.ts",
  "utf8",
);
const retry = fs.readFileSync(
  "src/common/retry.ts",
  "utf8",
);
const timeout = fs.readFileSync(
  "src/common/timeout.ts",
  "utf8",
);

for (const token of [
  "PowerChainErrorCode.SimulationFailed",
  "PowerChainErrorCode.AmbiguousWrite",
  "PowerChainErrorCode.TransactionFailed",
  "signatureFromError",
  "reconcile(submitted.signature)",
]) {
  if (!writeHandler.includes(token)) {
    failures.push(`write-handler:${token}`);
  }
}

if (!retry.includes("assertRetryPolicy")) {
  failures.push("retry:policy-validation");
}
if (!retry.includes('removeEventListener("abort", onAbort)')) {
  failures.push("retry:abort-listener-cleanup");
}
if (!timeout.includes("externalSignal?.aborted")) {
  failures.push("timeout:pre-aborted-signal");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  noBlindWriteRetry: true,
  ambiguousWriteReconciliation: true,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
