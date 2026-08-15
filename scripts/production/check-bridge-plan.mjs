import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-plan.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-plan.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "SOURCE_PREPARE",
  "SOURCE_SUBMIT",
  "SOURCE_FINALITY",
  "DESTINATION_PREPARE",
  "DESTINATION_SUBMIT",
  "DESTINATION_FINALITY",
  "RECONCILE",
  "never-blind",
  "safe-read-only",
  "bridgeEvidenceRequirements",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-plan:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "buildBridgeExecutionPlan",
  "bridgeEvidenceRequirements",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `bridge-plan:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "publicWrites:",
  "false",
  "blindRetry:",
  "SOURCE_SUBMIT",
  "DESTINATION_SUBMIT",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-plan:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/plan",
  )
) {
  failures.push(
    "bridge-plan:route-missing",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      deterministic:
        true,
      publicWrites:
        false,
      monetaryWriteSteps: [
        "SOURCE_SUBMIT",
        "DESTINATION_SUBMIT",
      ],
      blindRetry:
        false,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
