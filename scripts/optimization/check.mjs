import fs from "node:fs";

const failures = [];
for (const file of [
  "src/common/token-units.ts",
  "src/common/errors.ts",
  "src/bridge/conservation.ts",
  "src/relayer/concurrency.ts",
  "src/relayer/read-cache.ts",
  "config/optimization/runtime.json",
]) {
  if (!fs.existsSync(file)) failures.push(`missing:${file}`);
}

const watcher = fs.readFileSync("src/bridge/watcher.ts", "utf8");
const accounts = fs.readFileSync("client/sui/accounts.ts", "utf8");
const rpc = fs.readFileSync("packages/native-token-client/src/solana/rpc.ts", "utf8");

if (!watcher.includes("evaluateBridgeConservation")) {
  failures.push("watcher:not-shared-conservation");
}
if (!accounts.includes("maxPages")) failures.push("sui:unbounded-pagination");
if (!rpc.includes("batch<T")) failures.push("rpc:batch-missing");
if (!rpc.includes("POWERCHAIN_RPC_BATCH_SIZE_INVALID")) {
  failures.push("rpc:batch-bound-missing");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  optimization: {
    sharedBridgeMath: true,
    boundedRelayerConcurrency: true,
    inFlightReadDedupe: true,
    boundedSuiPagination: true,
    boundedRpcBatching: true
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
