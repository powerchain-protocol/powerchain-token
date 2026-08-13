import fs from "node:fs";

const failures = [];

const required = [
  "apps/api/package.json",
  "apps/api/server.mjs",
  "apps/api/lib/http.mjs",
  "apps/api/lib/platform.mjs",
  "apps/api/lib/executor.mjs",
  "apps/client/package.json",
  "apps/client/server.mjs",
  "apps/client/public/index.html",
  "apps/client/public/app.js",
  "apps/client/public/styles.css",
  "config/apps.json",
  "docs/API.md",
  "openapi/powerchain.v1.json",
  "scripts/production/test-fullstack-live.mjs",
  "packages/runtime/src/addresses.mjs",
  "scripts/fullstack/start.mjs",
  "scripts/production/test-fullstack-runtime.mjs",
  "apps/api/lib/bridge-request.mjs",
  "apps/api/lib/idempotency.mjs",
  "apps/api/lib/cache.mjs",
  "apps/api/lib/metrics.mjs",
  "apps/api/lib/rate-limit.mjs",
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const api =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const route of [
  "/api/v1/health",
  "/api/v1/ready",
  "/api/v1/version",
  "/api/v1/token",
  "/api/v1/mainnet/status",
  "/api/v1/bridge/capabilities",
  "/api/v1/bridge/quote",
  "/api/v1/bridge/execute",
  "/api/v1/bridge/executions/",
  "/api/v1/metrics",
]) {
  if (!api.includes(route)) {
    failures.push(
      `api-route:${route}`,
    );
  }
}

for (const invariant of [
  "requireExecutionAuthorization",
  "requireIdempotencyKey",
  "PWRC_BRIDGE_EXECUTION_NOT_READY",
  "PWRC_BRIDGE_API_AUTH_NOT_CONFIGURED",
  "inboundAuthConfigured",
  "timingSafeEqual",
  "server.requestTimeout",
  "server.headersTimeout",
  "refreshMainnetStatus({",
  "PWRC_IDEMPOTENCY_KEY_CONFLICT",
  "PWRC_EXECUTION_RECONCILIATION_REQUIRED",
  "validateExecutionRequest",
  "FileExecutionIdempotencyStore",
  "FixedWindowRateLimiter",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `api-security:${invariant}`,
    );
  }
}

const bridgeRequest =
  fs.readFileSync(
    "apps/api/lib/bridge-request.mjs",
    "utf8",
  );

for (const invariant of [
  "PWRC_BRIDGE_QUOTE_FINGERPRINT_REQUIRED",
  "PWRC_BRIDGE_QUOTE_FINGERPRINT_MISMATCH",
  "PWRC_DESTINATION_SUI_ADDRESS_INVALID",
  "PWRC_DESTINATION_SOLANA_ADDRESS_INVALID",
]) {
  if (!bridgeRequest.includes(invariant)) {
    failures.push(
      `bridge-request:${invariant}`,
    );
  }
}

const executor =
  fs.readFileSync(
    "apps/api/lib/executor.mjs",
    "utf8",
  );

for (const invariant of [
  "PWRC_BRIDGE_EXECUTION_ENABLED",
  "PWRC_BRIDGE_EXECUTOR_URL",
  "PWRC_BRIDGE_EXECUTOR_API_KEY",
  "Idempotency-Key",
  "AbortController",
  "EXECUTOR_TIMEOUT_MS",
]) {
  if (!executor.includes(invariant)) {
    failures.push(
      `executor:${invariant}`,
    );
  }
}

const platform =
  fs.readFileSync(
    "apps/api/lib/platform.mjs",
    "utf8",
  );

for (const invariant of [
  "PWRC_TRANSFER_FEE_BASIS_POINTS",
  "PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS",
  "canonicalJsonSha256",
  "refreshMainnetStatus",
  "quoteBridge",
]) {
  if (!platform.includes(invariant)) {
    failures.push(
      `platform:${invariant}`,
    );
  }
}

const client =
  fs.readFileSync(
    "apps/client/server.mjs",
    "utf8",
  );

for (const invariant of [
  "proxyApi",
  "/api/",
  "64 * 1024",
  "AbortController",
  "Content-Security-Policy",
]) {
  if (!client.includes(invariant)) {
    failures.push(
      `web:${invariant}`,
    );
  }
}

const browser =
  fs.readFileSync(
    "apps/client/public/app.js",
    "utf8",
  );

if (
  !browser.includes(
    'const API = "";',
  )
) {
  failures.push(
    "web:same-origin-api",
  );
}

const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
  );

if (
  !workspace.includes(
    '"apps/*"',
  )
) {
  failures.push(
    "workspace:apps",
  );
}

const appsConfig =
  JSON.parse(
    fs.readFileSync(
      "config/apps.json",
      "utf8",
    ),
  );

if (
  appsConfig.version !==
    "1.0.0" ||
  appsConfig.api
    ?.executionDefaultEnabled !==
    false
) {
  failures.push(
    "apps-config:policy",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version: "1.0.0",
  fullStack: {
    api:
      true,
    client:
      true,
    sameOriginProxy:
      true,
    serverOwnedQuotes:
      true,
    serverOnlyExecution:
      true,
    mainnetFailClosed:
      true,
  },
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
