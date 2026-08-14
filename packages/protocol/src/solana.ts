import { PublicKey } from "@solana/web3.js";
import {
  PWRC_LOCK_LOCALNET_PROGRAM_ID,
  PWRC_TOKEN_VERIFIER_PROGRAM_ID,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "./constants.js";
import {
  normalizeRpcUrl,
  normalizeWebSocketUrl,
} from "./urls.js";

export type SolanaCluster =
  | "localnet"
  | "devnet"
  | "mainnet-beta";

export type PowerChainProgramKind =
  | "pwrc-lock"
  | "pwrc-token";

export const SOLANA_SYSTEM_PROGRAM_ID =
  "11111111111111111111111111111111" as const;
export const SOLANA_TOKEN_PROGRAM_ID =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as const;
export const SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID =
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as const;
export const METAPLEX_TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as const;

export const SOLANA_PUBLIC_RPC = {
  localnet:
    "http://127.0.0.1:8899",
  devnet:
    "https://api.devnet.solana.com",
  "mainnet-beta":
    "https://api.mainnet.solana.com",
} as const;

export const SOLANA_PUBLIC_WS = {
  localnet:
    "ws://127.0.0.1:8900",
  devnet:
    "wss://api.devnet.solana.com",
  "mainnet-beta":
    "wss://api.mainnet.solana.com",
} as const;

export const POWERCHAIN_FORBIDDEN_DEPLOYMENT_PROGRAM_IDS =
  new Set<string>([
    SOLANA_SYSTEM_PROGRAM_ID,
    SOLANA_TOKEN_PROGRAM_ID,
    SOLANA_TOKEN_2022_PROGRAM_ID,
    SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID,
    METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  ]);

export function assertPublicKey(
  value: string,
): string {
  try {
    return new PublicKey(
      value.trim(),
    ).toBase58();
  } catch {
    throw new Error(
      "PWRC_PUBLIC_KEY_INVALID",
    );
  }
}

export function assertDeploymentProgramId(
  value: string,
): string {
  const normalized =
    assertPublicKey(value);

  if (
    POWERCHAIN_FORBIDDEN_DEPLOYMENT_PROGRAM_IDS
      .has(normalized)
  ) {
    throw new Error(
      "PWRC_RESERVED_PROGRAM_ID_FORBIDDEN",
    );
  }

  return normalized;
}

export function resolveProgramId(
  kind: PowerChainProgramKind,
  cluster: SolanaCluster,
  env: NodeJS.ProcessEnv =
    process.env,
): string {
  const prefix =
    kind === "pwrc-lock"
      ? "PWRC_LOCK_PROGRAM_ID"
      : "PWRC_TOKEN_PROGRAM_ID";

  if (
    cluster === "localnet"
  ) {
    return kind === "pwrc-lock"
      ? PWRC_LOCK_LOCALNET_PROGRAM_ID
      : PWRC_TOKEN_VERIFIER_PROGRAM_ID;
  }

  if (
    kind === "pwrc-token" &&
    cluster === "devnet"
  ) {
    return assertDeploymentProgramId(
      env["PWRC_TOKEN_PROGRAM_ID_DEVNET"]
        ?.trim() ||
        PWRC_TOKEN_VERIFIER_PROGRAM_ID,
    );
  }

  const suffix =
    cluster === "mainnet-beta"
      ? "MAINNET"
      : "DEVNET";

  const value =
    env[
      `${prefix}_${suffix}`
    ]?.trim();

  if (!value) {
    throw new Error(
      `POWERCHAIN_PROGRAM_ID_REQUIRED:${kind}:${cluster}`,
    );
  }

  return assertDeploymentProgramId(
    value,
  );
}

export function resolveRpc(
  cluster: SolanaCluster,
  env: NodeJS.ProcessEnv =
    process.env,
): string {
  const production =
    cluster === "mainnet-beta" &&
    env["NODE_ENV"] ===
      "production";

  const candidate =
    cluster === "mainnet-beta"
      ? env["PWRC_MAINNET_RPC_URL"]
          ?.trim() ||
        env["PWRC_RPC_URL"]
          ?.trim()
      : env["PWRC_RPC_URL"]
          ?.trim();

  if (candidate) {
    const normalized =
      normalizeRpcUrl(
        candidate,
        cluster ===
          "mainnet-beta",
      );

    if (
      production &&
      normalized ===
        SOLANA_PUBLIC_RPC[
          "mainnet-beta"
        ]
    ) {
      throw new Error(
        "PWRC_PRODUCTION_DEDICATED_RPC_REQUIRED",
      );
    }

    return normalized;
  }

  if (production) {
    throw new Error(
      "PWRC_PRODUCTION_DEDICATED_RPC_REQUIRED",
    );
  }

  return SOLANA_PUBLIC_RPC[
    cluster
  ];
}

export function resolveSecondaryRpc(
  cluster: SolanaCluster,
  env: NodeJS.ProcessEnv =
    process.env,
): string | null {
  const value =
    env[
      "PWRC_RPC_URL_SECONDARY"
    ]?.trim();

  if (!value) return null;

  const secondary =
    normalizeRpcUrl(
      value,
      cluster ===
        "mainnet-beta",
    );
  const primary =
    resolveRpc(
      cluster,
      env,
    );

  if (secondary === primary) {
    throw new Error(
      "PWRC_SECONDARY_RPC_MUST_DIFFER",
    );
  }

  return secondary;
}

export function resolveWebSocket(
  cluster: SolanaCluster,
  env: NodeJS.ProcessEnv =
    process.env,
): string {
  const value =
    env["PWRC_WS_URL"]
      ?.trim();

  if (value) {
    return normalizeWebSocketUrl(
      value,
      cluster ===
        "mainnet-beta",
    );
  }

  if (
    cluster ===
      "mainnet-beta" &&
    env["NODE_ENV"] ===
      "production"
  ) {
    throw new Error(
      "PWRC_PRODUCTION_DEDICATED_WS_REQUIRED",
    );
  }

  return SOLANA_PUBLIC_WS[
    cluster
  ];
}
