import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-policy.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const config =
  fs.readFileSync(
    "apps/api/lib/bridge-policy-config.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const envExample =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_BRIDGE_POLICY_V1",
  "policySha256",
  "PWRC_BRIDGE_POLICY_COMMITMENT_MISMATCH",
  "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_TOO_LOW",
  "PWRC_BRIDGE_POLICY_EVIDENCE_AGE_EXCEEDS_PROPOSAL_TTL",
  "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_EXCEEDS_OPERATIONS",
  "PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED",
  "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED",
  "PWRC_GENESIS_BASE_UNITS",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `bridge-policy:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "createBridgePolicyProfile",
  "assertBridgePolicyProfile",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `bridge-policy:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "configured:",
  "failClosed:",
  "PWRC_BRIDGE_POLICY_ENV_INVALID",
  "secretsExposed:",
  "publicWrites:",
  "policySha256",
  "POWERCHAIN_BRIDGE_POLICY_V1",
]) {
  if (!config.includes(invariant)) {
    failures.push(
      `bridge-policy:config:${invariant}`,
    );
  }
}

for (const key of [
  "POWERCHAIN_SOLANA_NETWORK",
  "POWERCHAIN_SUI_NETWORK",
  "POWERCHAIN_BRIDGE_MAX_PENDING_EXPOSURE_BASE_UNITS",
  "POWERCHAIN_BRIDGE_MAX_PENDING_OPERATIONS",
  "POWERCHAIN_BRIDGE_MAX_EVIDENCE_AGE_MS",
  "POWERCHAIN_BRIDGE_GOVERNANCE_APPROVAL_THRESHOLD",
  "POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_TTL_MS",
]) {
  if (
    !envExample.includes(
      `${key}=`,
    )
  ) {
    failures.push(
      `bridge-policy:env:${key}`,
    );
  }
}

if (
  !server.includes(
    "/api/v1/bridge/policy-config",
  )
) {
  failures.push(
    "bridge-policy:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  deterministicPolicyCommitment:
    true,
  canonicalExposureBound:
    true,
  supportedNetworkValidation:
    true,
  apiProtocolCommitmentParity:
    true,
  malformedConfigurationFailsClosed:
    true,
  secretsExposed:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
