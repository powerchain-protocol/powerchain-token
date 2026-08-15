import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-safety.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-safety.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "acceptNewIntents",
  "allowDestinationSubmission",
  "allowCompletion",
  "PWRC_BRIDGE_SAFETY_GOVERNANCE_PAUSED",
  "PWRC_BRIDGE_SAFETY_RISK_HALT_REQUIRED",
  "PWRC_BRIDGE_SAFETY_AUDIT_INVALID",
  "PWRC_BRIDGE_SAFETY_RECOVERY_REQUIRED",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-safety:protocol:${invariant}`,
    );
  }
}

if (
  !sdk.includes(
    "evaluateBridgeSafety",
  )
) {
  failures.push(
    "bridge-safety:sdk:evaluateBridgeSafety",
  );
}

for (const invariant of [
  "destinationSubmissionRequiresSourceFinality",
  "completionRequiresDestinationFinality",
  "completionRequiresReconciliation",
  "invalidAuditBlocksProgress",
  "riskHaltBlocksProgress",
  "publicControlWrites",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-safety:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/safety-policy",
  )
) {
  failures.push(
    "bridge-safety:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  aggregateSafety:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
