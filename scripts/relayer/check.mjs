import fs from "node:fs";

const failures = [];
const policy = JSON.parse(
  fs.readFileSync("config/relayer/policy.json", "utf8"),
);
const state = fs.readFileSync("src/relayer/state.ts", "utf8");
const idem = fs.readFileSync(
  "src/relayer/idempotency.ts",
  "utf8",
);
const watcher = fs.readFileSync(
  "src/bridge/watcher.ts",
  "utf8",
);

if (policy.mode !== "fail-closed") failures.push("mode");
if (policy.queue.idempotencyKeyRequired !== true) {
  failures.push("idempotency");
}
if (policy.queue.retryWritesBlindly !== false) {
  failures.push("blindWrites");
}
if (policy.separation.aiWorkerMayHoldSigningKey !== false) {
  failures.push("aiSigner");
}
if (!state.includes("CONSERVATION_VERIFIED")) {
  failures.push("state:conservation");
}
if (!idem.includes("PWRC_RELAYER_ALREADY_PROCESSED")) {
  failures.push("idempotency:finalizedGuard");
}
if (
  !watcher.includes("evaluateBridgeConservation") &&
  !watcher.includes("WRAPPED_EXPOSURE_EXCEEDS_LOCKED_CANONICAL")
) {
  failures.push("watcher:lockedInvariant");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  relayer: "fail-closed",
  failures,
}, null, 2));

if (failures.length) process.exit(1);
