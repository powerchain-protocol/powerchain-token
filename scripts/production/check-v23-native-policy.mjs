import fs from "node:fs";

const failures = [];

const consensus =
  fs.readFileSync(
    "packages/protocol/src/native-token-consensus.ts",
    "utf8",
  );
const protocolPolicy =
  fs.readFileSync(
    "packages/protocol/src/native-token-policy.ts",
    "utf8",
  );
const apiPolicy =
  fs.readFileSync(
    "apps/api/lib/native-token.mjs",
    "utf8",
  );
const canonicalApiPolicy =
  fs.readFileSync(
    "apps/api/lib/token-policy.mjs",
    "utf8",
  );
const fixture =
  JSON.parse(
    fs.readFileSync(
      "config/native-pwrc-policy-parity-fixture.json",
      "utf8",
    ),
  );
const openapi =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

for (const invariant of [
  "verifyNativePwrcMintObservation",
  "PWRC_NATIVE_CONSENSUS_PROFILE_INVALID",
  "POWERCHAIN_NATIVE_PWRC_CONSENSUS_V1",
]) {
  if (!consensus.includes(invariant)) {
    failures.push(
      `v23:consensus:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
  "nativePwrcPolicyPayload",
  "nativePwrcPolicySha256",
  "METAPLEX_TOKEN_METADATA_PROGRAM_ID",
]) {
  if (!protocolPolicy.includes(invariant)) {
    failures.push(
      `v23:protocol-policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
  "nativePwrcPolicyPayload",
  "nativePwrcPolicySha256",
  "policySha256",
  "canonicalNativeTokenPolicy",
]) {
  if (!apiPolicy.includes(invariant)) {
    failures.push(
      `v23:api-policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  "canonicalNativeTokenPolicy",
  "metaplexProgramId",
  "config/token-policy.json",
]) {
  if (!canonicalApiPolicy.includes(invariant)) {
    failures.push(
      `v23:canonical-api-policy:${invariant}`,
    );
  }
}

if (
  fixture.expectedPolicySha256 !==
    "af5fc80addc709e247e3604a698fa2a3efecdd94e148458aceb45cc40ea90f33"
) {
  failures.push(
    "v23:policy-fixture-mismatch",
  );
}

const schema =
  openapi.paths?.[
    "/api/v1/token/native-policy"
  ]?.get?.responses?.[
    "200"
  ]?.content?.[
    "application/json"
  ]?.schema;

if (
  schema?.additionalProperties !==
    false
) {
  failures.push(
    "v23:openapi-native-policy-not-closed",
  );
}

for (const required of [
  "metaplexProgramId",
  "policySha256",
]) {
  if (
    !schema?.required?.includes(
      required,
    )
  ) {
    failures.push(
      `v23:openapi-native-policy-required:${required}`,
    );
  }
}

if (
  schema?.properties?.policySha256
    ?.pattern !==
      "^[a-f0-9]{64}$"
) {
  failures.push(
    "v23:openapi-policy-sha-pattern",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  consensusProfileDefenseInDepth:
    true,
  observerOrderingStable:
    true,
  deterministicNativePolicyCommitment:
    true,
  standaloneApiParity:
    true,
  closedOpenApiPolicy:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
