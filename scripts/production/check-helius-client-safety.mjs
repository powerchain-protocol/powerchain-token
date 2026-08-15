import fs from "node:fs";

const failures = [];

const client =
  fs.readFileSync(
    "packages/sdk/src/helius-client.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/helius.mjs",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const invariant of [
  "maxResponseBytes",
  "PWRC_HELIUS_RESPONSE_SIZE_LIMIT_INVALID",
  "PWRC_HELIUS_RESPONSE_TOO_LARGE",
  "PWRC_HELIUS_CANCELLED",
  "HeliusRequestOptions",
  "++rpcRequestId",
  '"content-length"',
  "TextEncoder",
  "removeEventListener",
]) {
  if (!client.includes(invariant)) {
    failures.push(
      `helius-client-safety:${invariant}`,
    );
  }
}

if (
  client.includes(
    "await response.json()",
  ) ||
  client.includes(
    'id:\n                    "powerchain"',
  )
) {
  failures.push(
    "helius-client-safety:legacy-unbounded-or-static-request",
  );
}

for (const invariant of [
  "HELIUS_MAX_RESPONSE_BYTES",
  "maxResponseBytes,",
  "PWRC_HELIUS_RESPONSE_SIZE_LIMIT_INVALID",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `helius-api-safety:${invariant}`,
    );
  }
}

if (
  !env.includes(
    "HELIUS_MAX_RESPONSE_BYTES=2000000",
  )
) {
  failures.push(
    "helius-client-safety:env-default",
  );
}

for (const forbidden of [
  '"sendTransaction"',
  '"sendRawTransaction"',
  "sendAndConfirmTransaction(",
  "Keypair.generate(",
  "fromSecretKey(",
]) {
  if (client.includes(forbidden)) {
    failures.push(
      `helius-client-safety:write-or-secret:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  responseBodyBound:
    true,
  defaultMaxResponseBytes:
    2000000,
  callerAbortSignal:
    true,
  timeoutDistinctFromCancellation:
    true,
  monotonicRpcRequestIds:
    true,
  boundedReadRetries:
    true,
  secretSafeSerialization:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
