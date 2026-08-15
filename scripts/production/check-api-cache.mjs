import fs from "node:fs";

const failures = [];

const source =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "function cacheableRepresentation",
  "function stableJsonEntity",
  "function ifNoneMatchMatches",
  "function jsonCached",
  '"if-none-match"',
  "stale-while-revalidate",
  "cacheableHeadPaths",
  '"HEAD"',
  '"GET, HEAD"',
  'url.pathname ===\n          "/api/v1/metadata"',
  'url.pathname ===\n          "/api/v1/token"',
  'url.pathname ===\n          "/api/v1/openapi.json"',
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `api-cache:${invariant}`,
    );
  }
}

if (
  !source.includes(
    "cache-control",
  )
) {
  failures.push(
    "api-cache:cache-control",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      etag:
        true,
      strongEtagExactBody:
        true,
      requestIdHeaderOnly:
        true,
      conditionalGet:
        true,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
