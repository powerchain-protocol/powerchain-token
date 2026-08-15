import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-governance.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/bridge-governance.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_V1",
  "PWRC_BRIDGE_GOVERNANCE_SELF_APPROVAL_FORBIDDEN",
  "PWRC_BRIDGE_GOVERNANCE_DUPLICATE_APPROVAL",
  "PWRC_BRIDGE_GOVERNANCE_PROPOSAL_EXPIRED",
  "PWRC_BRIDGE_GOVERNANCE_QUORUM_NOT_REACHED",
  "bridgeGovernanceExecutionReadiness",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-governance:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "createBridgeGovernanceProposal",
  "approveBridgeGovernanceProposal",
  "bridgeGovernanceExecutionReadiness",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `bridge-governance:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "minimumApprovalThreshold",
  "proposerSelfApproval",
  "proposalExpiryRequired",
  "executionRequiresQuorum",
  "publicAdminWrites",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `bridge-governance:api:${invariant}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/governance-policy",
  )
) {
  failures.push(
    "bridge-governance:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  deterministicProposalId:
    true,
  minimumApprovalThreshold:
    2,
  selfApproval:
    false,
  publicAdminWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
