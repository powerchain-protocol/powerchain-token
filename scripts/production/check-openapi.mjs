import fs from "node:fs";
import {
  API_ROUTES,
} from "../../apps/api/lib/api-registry.mjs";

const failures = [];

const spec =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

if (
  spec.openapi !==
    "3.1.0"
) {
  failures.push(
    "openapi:version",
  );
}

if (
  spec.info?.version !==
    "1.0.0"
) {
  failures.push(
    "openapi:product-version",
  );
}

const operations =
  new Map();
const specRoutes =
  new Set();

for (const [
  path,
  pathItem,
] of
Object.entries(
  spec.paths ?? {},
)) {
  for (const method of [
    "get",
    "post",
    "put",
    "patch",
    "delete",
  ]) {
    const operation =
      pathItem?.[method];

    if (!operation) continue;

    const key =
      `${method.toUpperCase()} ${path}`;
    specRoutes.add(key);

    if (
      !operation.operationId
    ) {
      failures.push(
        `openapi:missing-operation-id:${key}`,
      );
    } else if (
      operations.has(
        operation.operationId,
      )
    ) {
      failures.push(
        `openapi:duplicate-operation-id:${operation.operationId}`,
      );
    } else {
      operations.set(
        operation.operationId,
        key,
      );
    }

    if (
      !operation.responses ||
      !Object.keys(
        operation.responses,
      ).length
    ) {
      failures.push(
        `openapi:missing-responses:${key}`,
      );
    }
  }
}

const registryRoutes =
  new Set(
    API_ROUTES.map(
      (route) =>
        `${route.method} ${route.path}`,
    ),
  );

for (const route of registryRoutes) {
  if (!specRoutes.has(route)) {
    failures.push(
      `openapi:missing-runtime-route:${route}`,
    );
  }
}

for (const route of specRoutes) {
  if (!registryRoutes.has(route)) {
    failures.push(
      `openapi:undeclared-runtime-route:${route}`,
    );
  }
}

for (const route of API_ROUTES) {
  const operation =
    spec.paths
      ?.[route.path]
      ?.[route.method.toLowerCase()];

  if (
    operation?.operationId !==
      route.operationId
  ) {
    failures.push(
      `openapi:operation-id-drift:${route.method}:${route.path}`,
    );
  }

  if (
    !operation?.tags?.includes(
      route.tag,
    )
  ) {
    failures.push(
      `openapi:tag-drift:${route.method}:${route.path}`,
    );
  }
}

const source =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  "/api/v1/openapi.json",
  "/swagger/openapi.yaml",
  "/swagger",
  "errorCode",
  "x-request-id",
  "x-ratelimit-remaining",
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `api-contract:${invariant}`,
    );
  }
}

for (const file of [
  "swagger/openapi.yaml",
  "swagger/swagger.yaml",
  "swagger.yaml",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `swagger:missing:${file}`,
    );
  }
}


const canonicalYaml =
  fs.readFileSync(
    "swagger/openapi.yaml",
    "utf8",
  );

for (const file of [
  "swagger/swagger.yaml",
  "swagger.yaml",
]) {
  if (
    fs.readFileSync(
      file,
      "utf8",
    ) !==
    canonicalYaml
  ) {
    failures.push(
      `swagger:alias-drift:${file}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      openapi:
        spec.openapi,
      paths:
        specRoutes.size,
      operationIds:
        operations.size,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
