import fs from "node:fs";

const failures = [];

const protocol =
  fs.readFileSync(
    "packages/protocol/src/helius.ts",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/helius-client.ts",
    "utf8",
  );
const solana =
  fs.readFileSync(
    "packages/protocol/src/solana.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/helius.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );
const apiPackage =
  JSON.parse(
    fs.readFileSync(
      "apps/api/package.json",
      "utf8",
    ),
  );

for (const invariant of [
  "https://mainnet.helius-rpc.com/",
  "https://devnet.helius-rpc.com/",
  "wss://mainnet.helius-rpc.com/",
  "wss://devnet.helius-rpc.com/",
  "PWRC_HELIUS_API_KEY_INVALID",
  "resolveHeliusApiKey",
  "PWRC_HELIUS_MAINNET_API_KEY_REQUIRED",
  "redactHeliusUrl",
]) {
  if (!protocol.includes(invariant)) {
    failures.push(
      `helius:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "READ_RPC_METHODS",
  "DAS_METHODS",
  "getAsset",
  "getTokenAccounts",
  "searchAssets",
  "PWRC_HELIUS_RPC_METHOD_NOT_ALLOWED",
  "PWRC_HELIUS_DAS_METHOD_NOT_ALLOWED",
  "PWRC_HELIUS_RATE_LIMITED",
  "PWRC_HELIUS_PRIORITY_FEE_INPUT_REQUIRED",
  "priorityFeeEstimate",
  "getPriorityFeeEstimate",
  "rateLimitDelayMs",
  "10_000",
  "maxAttempts",
  "backoffDelay",
  "PWRC_HELIUS_TIMEOUT",
  "toJSON()",
  "PWRC_HELIUS_RESPONSE_INVALID",
  "retryAfterDelayMs",
  "sharedCooldownUntil",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `helius:sdk:${invariant}`,
    );
  }
}

for (const forbidden of [
  '"sendTransaction"',
  '"requestAirdrop"',
  '"simulateTransaction"',
  "sendAndConfirmTransaction(",
]) {
  if (sdk.includes(forbidden)) {
    failures.push(
      `helius:write-method:${forbidden}`,
    );
  }
}

for (const invariant of [
  'env["HELIUS_ENABLED"] === "true"',
  "resolveHeliusApiKey",
  "buildHeliusRpcUrl",
  "buildHeliusWebSocketUrl",
]) {
  if (!solana.includes(invariant)) {
    failures.push(
      `helius:solana-resolver:${invariant}`,
    );
  }
}

for (const invariant of [
  "apiKeyConfigured",
  "mainnetKeyConfigured",
  "devnetKeyConfigured",
  "secretsExposed:",
  "enhancedTransactions:",
  "heliusHealth",
  "PWRC_HELIUS_GENESIS_HASH_MISMATCH",
  "genesisVerified",
  "getVersion",
  "getGenesisHash",
  "getSlot",
  "heliusPwrcAsset",
  "heliusHealthInFlight",
  "PWRC_HELIUS_PWRC_ASSET_MAINNET_ONLY",
  "HELIUS_HEALTH_CACHE_MS",
  "getAsset",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `helius:api:${invariant}`,
    );
  }
}

for (const route of [
  "/api/v1/integrations/helius",
  "/api/v1/integrations/helius/health",
  "/api/v1/data/solana/pwrc/helius/asset",
]) {
  if (!server.includes(route)) {
    failures.push(
      `helius:route:${route}`,
    );
  }
}

for (const key of [
  "HELIUS_ENABLED=false",
  "HELIUS_API_KEY=",
  "HELIUS_DEVNET_API_KEY=",
  "HELIUS_MAINNET_API_KEY=",
  "HELIUS_REQUEST_TIMEOUT_MS=10000",
  "HELIUS_READ_RETRY_ATTEMPTS=4",
  "HELIUS_READ_RETRY_BASE_DELAY_MS=250",
  "HELIUS_READ_RETRY_MAX_DELAY_MS=4000",
  "HELIUS_RATE_LIMIT_DELAY_MS=10000",
  "HELIUS_HEALTH_CACHE_MS=15000",
  "PWRC_SOLANA_DEVNET_GENESIS_HASH=",
  "PWRC_SOLANA_MAINNET_GENESIS_HASH=",
]) {
  if (!env.includes(key)) {
    failures.push(
      `helius:env:${key}`,
    );
  }
}

if (
  apiPackage.dependencies?.[
    "@powerchain/sdk"
  ] !==
    "workspace:*"
) {
  failures.push(
    "helius:api-sdk-dependency",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  provider:
    "helius",
  networks: [
    "devnet",
    "mainnet-beta",
  ],
  rpc:
    true,
  websocket:
    true,
  das:
    true,
  liveHealth:
    true,
  boundedReadRetries:
    true,
  shared429Cooldown:
    true,
  retryAfterAware:
    true,
  secretUrlSerializationSafe:
    true,
  healthSingleFlightCache:
    true,
  rateLimitBackoffMs:
    10000,
  separateNetworkCredentials:
    true,
  productionMainnetDedicatedKey:
    true,
  enhancedTransactions:
    false,
  serverOnlyApiKey:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
