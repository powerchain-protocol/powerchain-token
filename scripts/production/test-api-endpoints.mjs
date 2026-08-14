import {
  API_ROUTES,
  apiIndex,
} from "../../apps/api/lib/api-registry.mjs";
import {
  bridgeStatus,
  quoteSolanaToSuiBridge,
} from "../../apps/api/lib/bridge-routes.mjs";
import {
  readinessState,
} from "../../apps/api/lib/status.mjs";
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

const routeKeys =
  new Set();

for (const route of API_ROUTES) {
  const key =
    `${route.method}:${route.path}`;

  if (routeKeys.has(key)) {
    failures.push(
      `duplicate-route:${key}`,
    );
  }

  routeKeys.add(key);

  if (
    route.method !==
      "GET"
  ) {
    failures.push(
      `write-route:${key}`,
    );
  }
}

const status =
  bridgeStatus({
    PWRC_CLUSTER:
      "devnet",
    SUI_NETWORK:
      "devnet",
    PWRC_BRIDGE_EXECUTION_ENABLED:
      "false",
  });

if (
  status.enabled !==
    false ||
  status.writesExposedByThisApi !==
    false ||
  status.canonical.symbol !==
    "PWRC" ||
  status.wrapped.symbol !==
    "wPWRC"
) {
  failures.push(
    "bridge-status",
  );
}

const quote =
  quoteSolanaToSuiBridge({
    amountBaseUnits:
      "1000000000000",
    serviceEnabled:
      false,
    serviceBps:
      250,
    serviceRecipient:
      null,
    quoteTtlMs:
      30_000,
  });

if (
  quote.direction !==
    "solana-to-sui" ||
  quote.canonical
    .lockedBackingBaseUnits !==
    quote.wrapped
      .mintBaseUnits ||
  quote.wrapped.ratio !==
    "1:1-base-units"
) {
  failures.push(
    "bridge-quote",
  );
}

const ready =
  readinessState({
    cdpConfigured:
      false,
  });

if (
  ready.ready !==
    true ||
  ready.runtime
    .cdpSqlConfigured !==
    false
) {
  failures.push(
    "readiness",
  );
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
    "platform",
  );
}

const feePolicy =
  publicFeePolicy(
    {},
  );

if (
  feePolicy.nativeToken2022Fee
    ?.basisPoints !==
    250 ||
  feePolicy.nativeToken2022Fee
    ?.maximumFeeTokens !==
    "1000000" ||
  feePolicy.serviceFee
    ?.ordinaryWalletTransferExcluded !==
    true
) {
  failures.push(
    "fee-policy",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length ===
        0,
      version:
        "1.0.0",
      routes:
        API_ROUTES.length,
      bridgeQuote:
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
