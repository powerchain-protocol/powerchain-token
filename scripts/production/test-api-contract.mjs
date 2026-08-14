import fs from "node:fs";
import {
  API_ROUTES,
  apiIndex,
} from "../../apps/api/lib/api-registry.mjs";
import {
  publicFeePolicy,
  publicPlatformState,
} from "../../apps/api/lib/public-platform.mjs";

const failures = [];

const index =
  apiIndex();

if (
  index.version !==
    "1.0.0" ||
  index.basePath !==
    "/api/v1" ||
  index.endpoints.length !==
    API_ROUTES.length
) {
  failures.push(
    "api-index",
  );
}

const paths =
  new Set(
    API_ROUTES.map(
      (route) =>
        route.path,
    ),
  );

for (const required of [
  "/api/v1/health",
  "/api/v1/ready",
  "/api/v1/version",
  "/api/v1/platform",
  "/api/v1/token",
  "/api/v1/network",
  "/api/v1/fees/policy",
  "/api/v1/fees/quote",
  "/api/v1/bridge/status",
  "/api/v1/bridge/quote/solana-to-sui",
  "/api/v1/release/status",
  "/api/v1/devnet/status",
  "/api/v1/data/solana/pwrc/transfers",
  "/api/v1/data/solana/pwrc/volume",
  "/api/v1/data/solana/pwrc/instructions",
  "/api/v1/data/solana/pwrc/transfer-context",
  "/api/v1/data/solana/wallet/transfers",
]) {
  if (!paths.has(required)) {
    failures.push(
      `api-route:${required}`,
    );
  }
}

const platform =
  publicPlatformState(
    {},
  );

if (
  platform.canonicalAsset
    ?.mint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" ||
  platform.features
    ?.bridgeWritesExposed !==
    false
) {
  failures.push(
    "platform-contract",
  );
}

const fees =
  publicFeePolicy(
    {},
  );

if (
  fees.nativeToken2022Fee
    ?.basisPoints !==
    250 ||
  fees.nativeToken2022Fee
    ?.maximumFeeTokens !==
    "1000000" ||
  fees.serviceFee
    ?.ordinaryWalletTransferExcluded !==
    true
) {
  failures.push(
    "fee-policy-contract",
  );
}

const spec =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

if (
  spec.components?.schemas
    ?.ReleaseStatusResponse
    ?.properties
    ?.releaseState
    ?.enum
    ?.join(",") !==
    "SOURCE_READY,BUILD_READY,EVIDENCE_READY,AUTHORIZED,CONSUMED"
) {
  failures.push(
    "release-state-contract",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      endpoints:
        API_ROUTES.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
