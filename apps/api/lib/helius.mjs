import {
  createHeliusClient,
} from "@powerchain/sdk/helius";
import {
  resolveHeliusApiKey,
} from "@powerchain/protocol/helius";
import {
  resolveExpectedSolanaGenesisHash,
} from "@powerchain/protocol/solana";

function clusterToNetwork(
  cluster,
) {
  if (
    cluster ===
      "mainnet-beta"
  ) {
    return "mainnet-beta";
  }

  if (
    cluster ===
      "devnet"
  ) {
    return "devnet";
  }

  throw new Error(
    "PWRC_HELIUS_CLUSTER_UNSUPPORTED",
  );
}

function configuredKeyForNetwork(
  network,
  env,
) {
  if (
    network ===
      "mainnet-beta"
  ) {
    return Boolean(
      env.HELIUS_MAINNET_API_KEY?.trim() ||
      (
        env.NODE_ENV !==
          "production" &&
        env.HELIUS_API_KEY?.trim()
      ),
    );
  }

  return Boolean(
    env.HELIUS_DEVNET_API_KEY?.trim() ||
    env.HELIUS_API_KEY?.trim(),
  );
}

export function heliusConfigStatus(
  env =
    process.env,
) {
  const enabled =
    env.HELIUS_ENABLED ===
    "true";
  const cluster =
    env.PWRC_CLUSTER ??
    "localnet";
  const network =
    cluster ===
      "mainnet-beta" ||
    cluster ===
      "devnet"
      ? cluster
      : null;
  const apiKeyConfigured =
    network
      ? configuredKeyForNetwork(
          network,
          env,
        )
      : false;

  return {
    version:
      "1.0.0",
    enabled,
    apiKeyConfigured,
    mainnetKeyConfigured:
      Boolean(
        env.HELIUS_MAINNET_API_KEY?.trim(),
      ),
    devnetKeyConfigured:
      Boolean(
        env.HELIUS_DEVNET_API_KEY?.trim(),
      ),
    cluster,
    network,
    rpc:
      enabled &&
      apiKeyConfigured &&
      network !==
        null,
    websocket:
      enabled &&
      apiKeyConfigured &&
      network !==
        null,
    das:
      enabled &&
      apiKeyConfigured &&
      network !==
        null,
    secretsExposed:
      false,
    enhancedTransactions:
      false,
    publicWrites:
      false,
  };
}

export function createConfiguredHeliusClient(
  env =
    process.env,
) {
  if (
    env.HELIUS_ENABLED !==
      "true"
  ) {
    throw new Error(
      "PWRC_HELIUS_DISABLED",
    );
  }

  const network =
    clusterToNetwork(
      env.PWRC_CLUSTER ??
      "localnet",
    );

  const timeoutMs =
    Number(
      env.HELIUS_REQUEST_TIMEOUT_MS ??
      "10000",
    );

  if (
    !Number.isSafeInteger(
      timeoutMs,
    ) ||
    timeoutMs <
      1000 ||
    timeoutMs >
      60000
  ) {
    throw new Error(
      "PWRC_HELIUS_TIMEOUT_INVALID",
    );
  }

  const maxAttempts =
    Number(
      env.HELIUS_READ_RETRY_ATTEMPTS ??
      "4",
    );
  const baseDelayMs =
    Number(
      env.HELIUS_READ_RETRY_BASE_DELAY_MS ??
      "250",
    );
  const maxDelayMs =
    Number(
      env.HELIUS_READ_RETRY_MAX_DELAY_MS ??
      "4000",
    );
  const rateLimitDelayMs =
    Number(
      env.HELIUS_RATE_LIMIT_DELAY_MS ??
      "10000",
    );

  return createHeliusClient({
    apiKey:
      resolveHeliusApiKey(
        network,
        env,
      ),
    network,
    timeoutMs,
    retryPolicy: {
      maxAttempts,
      baseDelayMs,
      maxDelayMs,
      rateLimitDelayMs,
    },
  });
}


let heliusHealthCache =
  null;
let heliusHealthInFlight =
  null;

function heliusHealthCacheMs(
  env,
) {
  const value =
    Number(
      env.HELIUS_HEALTH_CACHE_MS ??
      "15000",
    );

  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <
      0 ||
    value >
      60_000
  ) {
    throw new Error(
      "PWRC_HELIUS_HEALTH_CACHE_INVALID",
    );
  }

  return value;
}

async function executeHeliusHealth(
  env,
) {
  const client =
    createConfiguredHeliusClient(
      env,
    );

  const genesisHash =
    await client.rpcRead(
      "getGenesisHash",
    );

  const expectedGenesisHash =
    resolveExpectedSolanaGenesisHash(
      client.network,
      env,
    );

  if (
    genesisHash !==
      expectedGenesisHash
  ) {
    throw new Error(
      "PWRC_HELIUS_GENESIS_HASH_MISMATCH",
    );
  }

  const [
    version,
    slot,
  ] =
    await Promise.all([
      client.rpcRead(
        "getVersion",
      ),
      client.rpcRead(
        "getSlot",
        [
          {
            commitment:
              "finalized",
          },
        ],
      ),
    ]);

  return {
    version:
      "1.0.0",
    provider:
      "helius",
    network:
      client.network,
    healthy:
      true,
    rpcVersion:
      version,
    genesisVerified:
      true,
    genesisHash,
    finalizedSlot:
      String(
        slot,
      ),
    publicWrites:
      false,
  };
}


export async function heliusHealth(
  env =
    process.env,
) {
  const cacheMs =
    heliusHealthCacheMs(
      env,
    );
  const network =
    clusterToNetwork(
      env.PWRC_CLUSTER ??
      "localnet",
    );
  const now =
    Date.now();

  if (
    cacheMs >
      0 &&
    heliusHealthCache?.network ===
      network &&
    now <
      heliusHealthCache.expiresAt
  ) {
    return {
      ...heliusHealthCache.value,
      cache:
        "hit",
    };
  }

  if (
    heliusHealthInFlight?.network ===
      network
  ) {
    return {
      ...await heliusHealthInFlight.promise,
      cache:
        "shared-flight",
    };
  }

  const promise =
    executeHeliusHealth(
      env,
    );

  heliusHealthInFlight = {
    network,
    promise,
  };

  try {
    const value =
      await promise;

    if (
      cacheMs >
        0
    ) {
      heliusHealthCache = {
        network,
        value,
        expiresAt:
          now +
          cacheMs,
      };
    }

    return {
      ...value,
      cache:
        "miss",
    };
  } finally {
    if (
      heliusHealthInFlight
        ?.promise ===
      promise
    ) {
      heliusHealthInFlight =
        null;
    }
  }
}

export async function heliusPwrcAsset(
  env =
    process.env,
) {
  const client =
    createConfiguredHeliusClient(
      env,
    );

  if (
    client.network !==
      "mainnet-beta"
  ) {
    throw new Error(
      "PWRC_HELIUS_PWRC_ASSET_MAINNET_ONLY",
    );
  }

  return client.das(
    "getAsset",
    {
      id:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      displayOptions: {
        showFungible:
          true,
      },
    },
  );
}
