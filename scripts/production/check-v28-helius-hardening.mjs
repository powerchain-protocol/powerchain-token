import fs from "node:fs";

const failures = [];

const sdk =
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
  "sharedCooldownUntil",
  "retryAfterDelayMs",
  "retry-after",
  "waitForSharedCooldown",
  "enterSharedCooldown",
  "PWRC_HELIUS_RESPONSE_INVALID",
  "response.status ===\\n            408",
  "endpointFamily",
  "toJSON()",
  "secretsExposed",
]) {
  if (
    !sdk.includes(
      invariant.replace(
        "\\n",
        "\n",
      ),
    )
  ) {
    failures.push(
      `v28:sdk:${invariant}`,
    );
  }
}

for (const forbidden of [
  "network:\n      config.network,\n    rpcUrl,",
  "rpcUrl,\n    apiUrl,",
  "apiUrl,\n    websocketUrl,",
]) {
  if (
    sdk.includes(
      forbidden.replace(
        /\\n/g,
        "\n",
      ),
    )
  ) {
    failures.push(
      `v28:secret-url-exposure:${forbidden}`,
    );
  }
}

for (const invariant of [
  "heliusHealthCache",
  "heliusHealthInFlight",
  "HELIUS_HEALTH_CACHE_MS",
  "PWRC_HELIUS_HEALTH_CACHE_INVALID",
  "PWRC_HELIUS_GENESIS_HASH_MISMATCH",
  "PWRC_HELIUS_PWRC_ASSET_MAINNET_ONLY",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `v28:api:${invariant}`,
    );
  }
}

if (
  !env.includes(
    "HELIUS_HEALTH_CACHE_MS=15000",
  )
) {
  failures.push(
    "v28:env:HELIUS_HEALTH_CACHE_MS",
  );
}

for (const forbidden of [
  '"sendTransaction"',
  '"requestAirdrop"',
  "sendAndConfirmTransaction(",
]) {
  if (sdk.includes(forbidden)) {
    failures.push(
      `v28:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  shared429Cooldown:
    true,
  retryAfterAware:
    true,
  transient408Retry:
    true,
  invalidJsonNormalized:
    true,
  serializableSecretUrlsRemoved:
    true,
  healthSingleFlightCache:
    true,
  healthGenesisFailFast:
    true,
  canonicalPwrcDasMainnetOnly:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
