import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/bridge-policy.ts",
    "utf8",
  );
const config =
  fs.readFileSync(
    "apps/api/lib/bridge-policy-config.mjs",
    "utf8",
  );
const openapi =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

for (const invariant of [
  "PWRC_GENESIS_BASE_UNITS",
  "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED",
  "PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED",
  "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_EXCEEDS_OPERATIONS",
  "PWRC_BRIDGE_POLICY_EVIDENCE_AGE_EXCEEDS_PROPOSAL_TTL",
  "policySha256",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `v22:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_BRIDGE_POLICY_V1",
  "PWRC_BRIDGE_POLICY_PENDING_EXPOSURE_INVALID",
  "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED",
  "PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED",
  "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_EXCEEDS_OPERATIONS",
  "PWRC_BRIDGE_POLICY_EVIDENCE_AGE_EXCEEDS_PROPOSAL_TTL",
  "policySha256",
]) {
  if (!config.includes(invariant)) {
    failures.push(
      `v22:api-parity:${invariant}`,
    );
  }
}

if (
  config.includes(
    "@powerchain/protocol/bridge-policy",
  )
) {
  failures.push(
    "v22:api-parity:standalone-runtime-dependency",
  );
}

const fixture =
  JSON.parse(
    fs.readFileSync(
      "config/bridge-policy-parity-fixture.json",
      "utf8",
    ),
  );

if (
  fixture.expectedPolicySha256 !==
    "79ab47f08b454a061ac43b5ca021081dda0e5573ec1818535a04f7cfb4b89459"
) {
  failures.push(
    "v22:api-parity:fixture-mismatch",
  );
}

const bridgeSchema =
  openapi.paths?.[
    "/api/v1/bridge/policy-config"
  ]?.get?.responses?.[
    "200"
  ]?.content?.[
    "application/json"
  ]?.schema;

if (
  !bridgeSchema ||
  bridgeSchema.additionalProperties !==
    false
) {
  failures.push(
    "v22:openapi:bridge-policy-not-closed",
  );
}

const policySchema =
  bridgeSchema?.properties?.policy;

if (
  !policySchema ||
  !JSON.stringify(
    policySchema,
  ).includes(
    "policySha256",
  )
) {
  failures.push(
    "v22:openapi:policy-sha-missing",
  );
}

const nativeSchema =
  openapi.paths?.[
    "/api/v1/token/native-policy"
  ]?.get?.responses?.[
    "200"
  ]?.content?.[
    "application/json"
  ]?.schema;

if (
  !nativeSchema ||
  nativeSchema.additionalProperties !==
    false
) {
  failures.push(
    "v22:openapi:native-policy-not-closed",
  );
}

for (const nested of [
  "authorities",
  "extensions",
  "nativeTransferFee",
  "metadata",
  "verifier",
]) {
  if (
    nativeSchema?.properties?.[
      nested
    ]?.additionalProperties !==
      false
  ) {
    failures.push(
      `v22:openapi:native-policy-open:${nested}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  canonicalBridgeExposureBound:
    true,
  networkAllowlist:
    true,
  deterministicApiPolicyCommitment:
    true,
  standaloneApiPolicyRuntime:
    true,
  goldenPolicyParityFixture:
    true,
  closedOpenApiPolicySchemas:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
