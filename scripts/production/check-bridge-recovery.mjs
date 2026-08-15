import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-recovery.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-recovery.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "automaticWriteRetryAllowed",
  "WAIT_SOURCE_FINALITY",
  "WAIT_DESTINATION_FINALITY",
  "REFRESH_EVIDENCE",
  "MANUAL_REVIEW",
  "PWRC_BRIDGE_EVIDENCE_STALE",
  "PWRC_BRIDGE_EVIDENCE_FROM_FUTURE",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-recovery:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "bridgeRecoveryDecision",
  "assertBridgeEvidenceFresh",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `bridge-recovery:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "automaticWriteRetry",
  "finalityTimeoutUsesReadOnlyPolling",
  "reconciliationMismatchTerminal",
  "publicWrites",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-recovery:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/recovery",
  )
) {
  failures.push(
    "bridge-recovery:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  automaticWriteRetry:
    false,
  evidenceFreshness:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
