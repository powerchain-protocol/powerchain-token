import type {
  SolanaCluster,
} from "./solana.js";

export type HeliusNetwork =
  | "devnet"
  | "mainnet-beta";

export interface HeliusEndpointSet {
  network:
    HeliusNetwork;
  rpcBaseUrl:
    string;
  websocketBaseUrl:
    string;
  apiBaseUrl:
    string;
}

const HELIUS_ENDPOINTS =
  Object.freeze({
    devnet: {
      network:
        "devnet",
      rpcBaseUrl:
        "https://devnet.helius-rpc.com/",
      websocketBaseUrl:
        "wss://devnet.helius-rpc.com/",
      apiBaseUrl:
        "https://devnet.helius-rpc.com/",
    },
    "mainnet-beta": {
      network:
        "mainnet-beta",
      rpcBaseUrl:
        "https://mainnet.helius-rpc.com/",
      websocketBaseUrl:
        "wss://mainnet.helius-rpc.com/",
      apiBaseUrl:
        "https://mainnet.helius-rpc.com/",
    },
  } satisfies Record<
    HeliusNetwork,
    HeliusEndpointSet
  >);

function assertHeliusApiKey(
  apiKey:
    string,
): string {
  const normalized =
    apiKey.trim();

  if (
    normalized.length <
      8 ||
    normalized.length >
      256 ||
    /[\s/?#&=]/.test(
      normalized,
    )
  ) {
    throw new Error(
      "PWRC_HELIUS_API_KEY_INVALID",
    );
  }

  return normalized;
}

export function heliusNetworkForCluster(
  cluster:
    SolanaCluster,
): HeliusNetwork {
  if (
    cluster ===
      "localnet"
  ) {
    throw new Error(
      "PWRC_HELIUS_LOCALNET_UNSUPPORTED",
    );
  }

  return cluster;
}

export function heliusEndpoints(
  network:
    HeliusNetwork,
): HeliusEndpointSet {
  return HELIUS_ENDPOINTS[
    network
  ];
}

export function buildHeliusRpcUrl(
  network:
    HeliusNetwork,
  apiKey:
    string,
): string {
  const endpoint =
    new URL(
      heliusEndpoints(
        network,
      ).rpcBaseUrl,
    );

  endpoint.searchParams.set(
    "api-key",
    assertHeliusApiKey(
      apiKey,
    ),
  );

  return endpoint.toString();
}

export function buildHeliusApiUrl(
  network:
    HeliusNetwork,
  apiKey:
    string,
): string {
  const endpoint =
    new URL(
      heliusEndpoints(
        network,
      ).apiBaseUrl,
    );

  endpoint.searchParams.set(
    "api-key",
    assertHeliusApiKey(
      apiKey,
    ),
  );

  return endpoint.toString();
}

export function buildHeliusWebSocketUrl(
  network:
    HeliusNetwork,
  apiKey:
    string,
): string {
  const endpoint =
    new URL(
      heliusEndpoints(
        network,
      ).websocketBaseUrl,
    );

  endpoint.searchParams.set(
    "api-key",
    assertHeliusApiKey(
      apiKey,
    ),
  );

  return endpoint.toString();
}

export function redactHeliusUrl(
  value:
    string,
): string {
  const url =
    new URL(
      value,
    );

  if (
    url.searchParams.has(
      "api-key",
    )
  ) {
    url.searchParams.set(
      "api-key",
      "REDACTED",
    );
  }

  return url.toString();
}


export function resolveHeliusApiKey(
  network:
    HeliusNetwork,
  env:
    NodeJS.ProcessEnv =
      process.env,
): string {
  const key =
    network ===
      "mainnet-beta"
      ? env[
          "HELIUS_MAINNET_API_KEY"
        ]?.trim()
      : env[
          "HELIUS_DEVNET_API_KEY"
        ]?.trim();

  const generic =
    env[
      "HELIUS_API_KEY"
    ]?.trim();

  const productionMainnet =
    network ===
      "mainnet-beta" &&
    env["NODE_ENV"] ===
      "production";

  if (
    productionMainnet &&
    !key
  ) {
    throw new Error(
      "PWRC_HELIUS_MAINNET_API_KEY_REQUIRED",
    );
  }

  const selected =
    key ||
    generic;

  if (!selected) {
    throw new Error(
      "PWRC_HELIUS_API_KEY_REQUIRED",
    );
  }

  return assertHeliusApiKey(
    selected,
  );
}
