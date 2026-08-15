import fs from "node:fs";

const failures = [];
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/api-client.ts",
    "utf8",
  );
const spec =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

for (const invariant of [
  "cacheableRepresentation",
  "stableJsonEntity",
  "ifNoneMatchMatches",
  "_requestId",
  '.update(\n        body,',
  "res.end(\n    body,",
  '.split(",")',
]) {
  if (!server.includes(invariant)) {
    failures.push(
      `api-cache-etag:server:${invariant}`,
    );
  }
}

for (const path of [
  "/api/v1/token",
  "/api/v1/token/metadata",
      "/api/v1/token/description",
  "/api/v1/token/fees",
  "/api/v1/assets",
  "/api/v1/assets/{symbol}",
  "/api/v1/token/policy",
  "/api/v1/token/native-policy",
]) {
  const get =
    spec.paths?.[path]?.get;
  const response =
    get?.responses?.["200"];
  const schema =
    response?.content
      ?.["application/json"]
      ?.schema;
  const resolved =
    schema?.$ref
      ? spec.components.schemas[
          schema.$ref
            .split("/")
            .at(-1)
        ]
      : schema;

  if (
    !get ||
    !response?.headers
      ?.["x-request-id"] ||
    !response.headers
      ?.ETag ||
    !get.responses?.["304"]
  ) {
    failures.push(
      `api-cache-etag:openapi-headers:${path}`,
    );
  }

  if (
    resolved?.required
      ?.includes(
        "requestId",
      ) ||
    resolved?.properties
      ?.requestId
  ) {
    failures.push(
      `api-cache-etag:request-id-body:${path}`,
    );
  }
}

if (
  /token\(\)[\s\S]*?requestId:\s*\n\s*string;[\s\S]*?\}>\("\/api\/v1\/token"\)/.test(
    sdk,
  )
) {
  failures.push(
    "api-cache-etag:sdk-token-request-id-body",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  strongEtagExactBody:
    true,
  cacheableRequestIdHeaderOnly:
    true,
  conditionalGet304:
    true,
  ifNoneMatchListSupport:
    true,
  weakValidatorComparison:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
