import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const spec =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

test(
  "cacheable API strips request-scoped requestId from representation",
  () => {
    for (const invariant of [
      "cacheableRepresentation",
      "requestId:",
      "_requestId",
      "stableJsonEntity",
    ]) {
      assert.ok(
        server.includes(invariant),
      );
    }
  },
);

test(
  "ETag is computed from the exact serialized representation body",
  () => {
    assert.ok(
      server.includes(
        "const body =",
      ),
    );
    assert.ok(
      server.includes(
        '.update(\n        body,',
      ),
    );
    assert.ok(
      server.includes(
        "res.end(\n    body,",
      ),
    );
  },
);

test(
  "conditional GET handles lists, wildcard and weak validators",
  () => {
    for (const invariant of [
      "ifNoneMatchMatches",
      '.split(",")',
      'candidate ===\n          "*"',
      "replace(\n          /^W\\//",
    ]) {
      assert.ok(
        server.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "OpenAPI moves cache request tracing to headers and documents 304",
  () => {
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
        spec.paths[path].get;
      const schema =
        get.responses["200"]
          .content[
            "application/json"
          ].schema;
      const resolved =
        schema.$ref
          ? spec.components.schemas[
              schema.$ref.split("/").at(-1)
            ]
          : schema;

      assert.equal(
        resolved.required?.includes(
          "requestId",
        ) ?? false,
        false,
      );
      assert.equal(
        "requestId" in
          (resolved.properties ?? {}),
        false,
      );
      assert.ok(
        get.responses["200"]
          .headers[
            "x-request-id"
          ],
      );
      assert.ok(
        get.responses["304"],
      );
    }
  },
);
