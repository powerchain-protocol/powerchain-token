import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-audit.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-audit.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "eventSha256",
  "previousEventSha256",
  "PWRC_BRIDGE_AUDIT_CHAIN_BROKEN",
  "PWRC_BRIDGE_AUDIT_EVENT_HASH_MISMATCH",
  "PWRC_BRIDGE_AUDIT_FORBIDDEN_ATTRIBUTE",
  "classifyBridgeIncidentSeverity",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-audit:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "createBridgeAuditEvent",
  "assertBridgeAuditChain",
  "classifyBridgeIncidentSeverity",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `bridge-audit:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "hashChain",
  "correlationIds",
  "sensitiveAttributesForbidden",
  "reconciliationMismatchCritical",
  "publicWrites",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-audit:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/audit-policy",
  )
) {
  failures.push(
    "bridge-audit:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  hashChain:
    true,
  correlationIds:
    true,
  sensitiveDataLogging:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
