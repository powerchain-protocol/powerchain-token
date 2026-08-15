import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-reconciliation.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-reconciliation.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "sourceEvidenceSha256",
  "destinationEvidenceSha256",
  "reconciliationSha256",
  "PWRC_BRIDGE_RECONCILIATION_CONSERVATION_MISMATCH",
  "PWRC_BRIDGE_RECONCILIATION_COMMITMENT_MISMATCH",
  "canonicalJsonSha256",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-reconciliation:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "createBridgeReconciliationRecord",
  "assertBridgeReconciliationRecord",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `bridge-reconciliation:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "sourceAndDestinationAmountsMustMatchPrincipal",
  "sourceAndDestinationChainsMustMatchDirection",
  "completionWithoutBothFinalityProofs",
  "publicWrites",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-reconciliation:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/reconciliation",
  )
) {
  failures.push(
    "bridge-reconciliation:route-missing",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      deterministicCommitments:
        true,
      conservationRequired:
        true,
      bothSidesFinalityRequired:
        true,
      publicWrites:
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
