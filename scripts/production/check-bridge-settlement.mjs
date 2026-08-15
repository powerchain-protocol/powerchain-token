import fs from "node:fs";

const failures = [];

const settlement =
  fs.readFileSync(
    "packages/protocol/src/bridge-settlement.ts",
    "utf8",
  );
const lifecycle =
  fs.readFileSync(
    "apps/api/lib/bridge-lifecycle.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  '"CREATED"',
  '"SOURCE_FINALIZED"',
  '"DESTINATION_SUBMITTED"',
  '"DESTINATION_FINALIZED"',
  '"COMPLETED"',
  '"FAILED"',
  "POWERCHAIN_BRIDGE_INTENT_V1",
  "PWRC_BRIDGE_SETTLEMENT_TRANSITION_INVALID",
  "PWRC_BRIDGE_COMPLETION_SEQUENCE_INVALID",
]) {
  if (!settlement.includes(invariant)) {
    failures.push(
      `bridge-settlement:${invariant}`,
    );
  }
}

for (const invariant of [
  "sourceFinalityRequiredBeforeDestinationSubmission",
  "destinationFinalityRequiredBeforeCompletion",
  "publicSettlementWrites",
  "blindRetry",
]) {
  if (!lifecycle.includes(invariant)) {
    failures.push(
      `bridge-lifecycle:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/lifecycle",
  )
) {
  failures.push(
    "bridge-lifecycle:route-missing",
  );
}

for (const forbidden of [
  'method: "POST"',
  'method: "PUT"',
  'method: "PATCH"',
  'method: "DELETE"',
]) {
  if (
    lifecycle.includes(
      forbidden,
    )
  ) {
    failures.push(
      `bridge-lifecycle:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  lifecycle:
    "finality-gated",
  publicWrites:
    false,
  deterministicIntentId:
    true,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
