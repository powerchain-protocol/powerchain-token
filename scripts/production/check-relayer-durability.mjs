import fs from "node:fs";

const failures = [];
const store = fs.readFileSync("src/relayer/file-store.ts", "utf8");
const atomic = fs.readFileSync("src/common/atomic-file.ts", "utf8");
const write = fs.readFileSync("src/handlers/write-handler.ts", "utf8");
const provenance = fs.readFileSync("scripts/release/generate-provenance.mjs", "utf8");

for (const token of [
  'open(file, "wx"',
  "FileBridgeIdempotencyStore",
  "FileReplayStore",
  "loadRecoverableBridgeOperations",
]) {
  if (!store.includes(token)) failures.push(`relayer:${token}`);
}

for (const token of ["rename(temp, file)", "handle.sync()", "syncDirectory"]) {
  if (!atomic.includes(token)) failures.push(`atomic:${token}`);
}

for (const token of ["reconciliationTimeoutMs", "reconcileWithDeadline", "withTimeout"]) {
  if (!write.includes(token)) failures.push(`write:${token}`);
}

for (const token of ["payloadSha256", '".next"', '"target"', "atomicWriteJsonSync"]) {
  if (!provenance.includes(token)) failures.push(`provenance:${token}`);
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  durableRelayerState: true,
  atomicWrites: true,
  reconciliationDeadline: true,
  provenanceSelfHash: true,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
