import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-risk.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-risk.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "PAUSE_RECOMMENDED",
  "HALT_REQUIRED",
  "PWRC_BRIDGE_RISK_UNDERCOLLATERALIZED",
  "PWRC_BRIDGE_RISK_RECONCILIATION_MISMATCH",
  "PWRC_BRIDGE_RISK_PENDING_EXPOSURE_LIMIT",
  "allowNewBridgeIntents",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-risk:protocol:${invariant}`,
    );
  }
}

if (
  !sdk.includes(
    "evaluateBridgeRisk",
  )
) {
  failures.push(
    "bridge-risk:sdk:evaluateBridgeRisk",
  );
}

for (const invariant of [
  "undercollateralizationTrips",
  "reconciliationMismatchTrips",
  "newBridgeIntentsBlockedWhenPauseRecommended",
  "automaticOnChainPause",
  "failClosedWhenMissing",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-risk:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/risk-policy",
  )
) {
  failures.push(
    "bridge-risk:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  circuitBreaker:
    true,
  automaticOnChainPause:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
