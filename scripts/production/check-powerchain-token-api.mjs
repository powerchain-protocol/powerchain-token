import fs from "node:fs";
import {
  powerChainTokenApiIndex,
  publicAssetBySymbol,
  publicAssetRegistry,
} from "../../apps/api/lib/assets.mjs";
import {
  publicMetadataState,
} from "../../apps/api/lib/metadata.mjs";
import {
  publicFeePolicy,
} from "../../apps/api/lib/public-platform.mjs";

const failures = [];
const policySha =
  "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4";

const tokenApi =
  powerChainTokenApiIndex();
const assets =
  publicAssetRegistry();
const metadata =
  publicMetadataState();
const fees =
  publicFeePolicy({});
const pwrc =
  publicAssetBySymbol(
    "PWRC",
  );
const wpwrc =
  publicAssetBySymbol(
    "wpwrc",
  );

if (
  tokenApi.product !==
    "PowerChain Token API" ||
  tokenApi.resource !==
    "PWRC" ||
  tokenApi.tokenPolicySha256 !==
    policySha ||
  tokenApi.publicWrites !==
    false
) {
  failures.push(
    "powerchain-token-api:index",
  );
}

if (
  assets.count !==
    2 ||
  assets.tokenPolicySha256 !==
    policySha ||
  assets.publicWrites !==
    false ||
  pwrc?.canonical !==
    true ||
  pwrc?.mint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" ||
  wpwrc?.wrapped !==
    true ||
  wpwrc?.canonicalAsset !==
    "PWRC"
) {
  failures.push(
    "powerchain-token-api:assets",
  );
}

if (
  metadata.tokenPolicySha256 !==
    policySha ||
  fees.tokenPolicySha256 !==
    policySha
) {
  failures.push(
    "powerchain-token-api:policy-parity",
  );
}

const registry =
  fs.readFileSync(
    "apps/api/lib/api-registry.mjs",
    "utf8",
  );
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

for (const path of [
  "/api/v1/token/metadata",
  "/api/v1/token/fees",
  "/api/v1/assets",
  "/api/v1/assets/{symbol}",
]) {
  if (
    !registry.includes(
      path,
    ) ||
    !spec.paths?.[
      path
    ]
  ) {
    failures.push(
      `powerchain-token-api:route:${path}`,
    );
  }
}

for (const method of [
  "tokenMetadata()",
  "tokenFees()",
  "assets()",
  "asset(",
]) {
  if (!sdk.includes(method)) {
    failures.push(
      `powerchain-token-api:sdk:${method}`,
    );
  }
}

for (const invariant of [
  'url.pathname ===\n          "/api/v1/token/"',
  '"/api/v1/assets/"',
  "publicAssetBySymbol",
  "PWRC_ASSET_NOT_FOUND",
]) {
  if (!server.includes(invariant)) {
    failures.push(
      `powerchain-token-api:server:${invariant}`,
    );
  }
}

for (const forbidden of [
  "sendTransaction(",
  "sendRawTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    fs.readFileSync(
      "apps/api/lib/assets.mjs",
      "utf8",
    ).includes(
      forbidden,
    )
  ) {
    failures.push(
      `powerchain-token-api:write:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  tokenApiBase:
    "/api/v1/token",
  assetApiBase:
    "/api/v1/assets",
  canonicalAssets: [
    "PWRC",
    "wPWRC",
  ],
  openApiPaths:
    Object.keys(
      spec.paths,
    ).length,
  policyBound:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
