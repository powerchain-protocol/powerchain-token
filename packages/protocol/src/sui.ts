import {
  normalizeRpcUrl,
  normalizeWebSocketUrl,
} from "./urls.js";

export type SuiNetwork =
  | "localnet"
  | "devnet"
  | "testnet"
  | "mainnet";

export const SUI_PUBLIC_RPC = {
  localnet:
    "http://127.0.0.1:9000",
  devnet:
    "https://fullnode.devnet.sui.io:443",
  testnet:
    "https://fullnode.testnet.sui.io:443",
  mainnet:
    "https://fullnode.mainnet.sui.io:443",
} as const;

export const POWERCHAIN_SUI_ALIAS_ADDRESS =
  "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1" as const;

export function normalizeSuiAddress(
  value: string,
): string {
  const normalized =
    value.trim().toLowerCase();

  if (
    !/^0x[a-f0-9]{64}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      "PWRC_SUI_ADDRESS_INVALID",
    );
  }

  return normalized;
}

export function normalizeSuiObjectId(
  value: string,
): string {
  return normalizeSuiAddress(
    value,
  );
}

export function resolveSuiRpc(
  network: SuiNetwork,
  env: NodeJS.ProcessEnv =
    process.env,
): string {
  const production =
    network === "mainnet" &&
    env["NODE_ENV"] ===
      "production";

  const candidate =
    network === "mainnet"
      ? env["SUI_MAINNET_RPC_URL"]
          ?.trim() ||
        env["SUI_RPC_URL"]
          ?.trim()
      : env["SUI_RPC_URL"]
          ?.trim();

  if (candidate) {
    const normalized =
      normalizeRpcUrl(
        candidate,
        network ===
          "mainnet",
      );

    if (
      production &&
      normalized ===
        SUI_PUBLIC_RPC.mainnet
    ) {
      throw new Error(
        "PWRC_SUI_PRODUCTION_DEDICATED_RPC_REQUIRED",
      );
    }

    return normalized;
  }

  if (production) {
    throw new Error(
      "PWRC_SUI_PRODUCTION_DEDICATED_RPC_REQUIRED",
    );
  }

  return SUI_PUBLIC_RPC[
    network
  ];
}

export function resolveSuiSecondaryRpc(
  network: SuiNetwork,
  env: NodeJS.ProcessEnv =
    process.env,
): string | null {
  const raw =
    env[
      "SUI_RPC_URL_SECONDARY"
    ]?.trim();

  if (!raw) return null;

  const secondary =
    normalizeRpcUrl(
      raw,
      network === "mainnet",
    );
  const primary =
    resolveSuiRpc(
      network,
      env,
    );

  if (secondary === primary) {
    throw new Error(
      "PWRC_SUI_SECONDARY_RPC_MUST_DIFFER",
    );
  }

  return secondary;
}

export function resolveSuiWebSocket(
  network: SuiNetwork,
  env: NodeJS.ProcessEnv =
    process.env,
): string | null {
  const raw =
    env["SUI_WS_URL"]
      ?.trim();

  if (!raw) return null;

  return normalizeWebSocketUrl(
    raw,
    network === "mainnet",
  );
}

export interface WpwrcDeployment {
  network:
    SuiNetwork;
  packageId:
    string;
  coinType:
    string;
  bridgeControllerId:
    string;
  metadataCapabilityId:
    string | null;
}

export function loadWpwrcDeployment(
  network: SuiNetwork,
  env: NodeJS.ProcessEnv =
    process.env,
): WpwrcDeployment {
  const packageId =
    normalizeSuiObjectId(
      env[
        "WPWRC_SUI_PACKAGE_ID"
      ]?.trim() ||
      "",
    );
  const controller =
    normalizeSuiObjectId(
      env[
        "WPWRC_SUI_BRIDGE_CONTROLLER_ID"
      ]?.trim() ||
      "",
    );
  const coinType =
    env[
      "WPWRC_SUI_COIN_TYPE"
    ]?.trim();

  if (
    !coinType ||
    !coinType.startsWith(
      `${packageId}::`,
    )
  ) {
    throw new Error(
      "PWRC_SUI_COIN_TYPE_INVALID",
    );
  }

  const metadata =
    env[
      "WPWRC_SUI_METADATA_CAPABILITY_ID"
    ]?.trim();

  return {
    network,
    packageId,
    coinType,
    bridgeControllerId:
      controller,
    metadataCapabilityId:
      metadata
        ? normalizeSuiObjectId(
            metadata,
          )
        : null,
  };
}
