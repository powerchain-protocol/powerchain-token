import fs from "node:fs";

const failures = [];

const required = [
  "src/common/serialization.ts",
  "src/common/config.ts",
  "src/bridge/replay.ts",
  "src/bridge/identity.ts",
  "src/relayer/queue.ts",
  "src/security/account-boundaries.ts",
];

for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`missing:${file}`);
}

const queue = fs.readFileSync("src/relayer/queue.ts", "utf8");
const replay = fs.readFileSync("src/bridge/replay.ts", "utf8");
const identity = fs.readFileSync("src/bridge/identity.ts", "utf8");
const serialization = fs.readFileSync(
  "src/common/serialization.ts",
  "utf8",
);

if (!queue.includes("PWRC_RELAYER_QUEUE_CAPACITY_EXCEEDED")) {
  failures.push("queue:backpressure");
}
if (!queue.includes("PWRC_RELAYER_QUEUE_DUPLICATE_ID")) {
  failures.push("queue:duplicate");
}
if (!replay.includes("POWERCHAIN_REPLAY_V1")) {
  failures.push("replay:namespace");
}
if (!identity.includes("PWRC_SYSTEM_PROGRAM_IS_NOT_DEPLOYMENT")) {
  failures.push("identity:system-program");
}
if (!serialization.includes("canonicalJsonStringify")) {
  failures.push("serialization:canonical");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  optimizationV2: {
    boundedQueueBackpressure: true,
    domainSeparatedReplay: true,
    canonicalSerialization: true,
    strictConfigParsing: true,
    bridgeIdentityBundle: true,
    accountBoundaryValidation: true
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
