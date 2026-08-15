import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const policySource =
  fs.readFileSync(
    "apps/api/lib/token-policy.mjs",
    "utf8",
  );
const nativeAdapter =
  fs.readFileSync(
    "apps/api/lib/native-token.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const registry =
  fs.readFileSync(
    "apps/api/lib/api-registry.mjs",
    "utf8",
  );
const sdkClient =
  fs.readFileSync(
    "packages/sdk/src/api-client.ts",
    "utf8",
  );
const sdkToken =
  fs.readFileSync(
    "packages/sdk/src/token.ts",
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
  "config/token-policy.json",
  "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  "PWRC_TOKEN_POLICY_COMMITMENT_MISMATCH",
  "canonicalTokenPolicy",
  "canonicalNativeTokenPolicy",
]) {
  if (!policySource.includes(invariant)) {
    failures.push(
      `token-api:policy-source:${invariant}`,
    );
  }
}

if (
  !nativeAdapter.includes(
    "canonicalNativeTokenPolicy",
  ) ||
  !nativeAdapter.includes(
    "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
  )
) {
  failures.push(
    "token-api:legacy-native-adapter",
  );
}

for (const source of [
  server,
  registry,
  sdkClient,
]) {
  if (
    !source.includes(
      "/api/v1/token/policy",
    )
  ) {
    failures.push(
      "token-api:route-wiring",
    );
  }
}

for (const invariant of [
  "@powerchain/protocol/token-amount",
  "@powerchain/protocol/token-policy",
  "@powerchain/protocol/fees",
]) {
  if (!sdkToken.includes(invariant)) {
    failures.push(
      `token-api:sdk-token:${invariant}`,
    );
  }
}

const schema =
  openapi.paths?.[
    "/api/v1/token/policy"
  ]?.get?.responses?.[
    "200"
  ]?.content?.[
    "application/json"
  ]?.schema;

if (
  schema?.additionalProperties !==
    false ||
  schema?.properties?.policySha256?.const !==
    "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4" ||
  schema?.properties?.publicWrites?.const !==
    false
) {
  failures.push(
    "token-api:openapi-policy-schema",
  );
}

for (const forbidden of [
  "sendTransaction(",
  "sendAndConfirmTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    policySource.includes(forbidden) ||
    sdkToken.includes(forbidden)
  ) {
    failures.push(
      `token-api:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  canonicalPolicySource:
    "config/token-policy.json",
  canonicalPolicyRoute:
    "/api/v1/token/policy",
  legacyNativePolicyCompatibility:
    true,
  sdkExactAmountFacade:
    true,
  closedOpenApiSchema:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
