import { PublicKey } from "@solana/web3.js";

export const SOLANA_SYSTEM_PROGRAM_ID =
  "11111111111111111111111111111111" as const;

export const SOLANA_TOKEN_PROGRAM_ID =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as const;

export const SOLANA_TOKEN_2022_PROGRAM_ID =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" as const;

export const SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID =
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as const;

export const METAPLEX_TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as const;

// Compile-time/development ID only. Do not treat this as a verified deployment.
export const PWRC_FEES_DEVELOPMENT_PROGRAM_ID =
  "9Ty7dY7pLmMAdH9nJHD4FSZxkRCAGbce12fs7AJV4pW7" as const;

export type SolanaCluster = "localnet" | "devnet" | "mainnet-beta";

export const SOLANA_PUBLIC_RPC: Record<SolanaCluster, string> = {
  localnet: "http://127.0.0.1:8899",
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet.solana.com",
};


export const POWERCHAIN_FORBIDDEN_DEPLOYMENT_PROGRAM_IDS =
  new Set<string>([
    SOLANA_SYSTEM_PROGRAM_ID,
    SOLANA_TOKEN_PROGRAM_ID,
    SOLANA_TOKEN_2022_PROGRAM_ID,
    SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID,
    METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  ]);

export function assertPowerChainDeploymentProgramId(
  value: string,
  cluster: SolanaCluster,
): string {
  let key: PublicKey;
  try {
    key = new PublicKey(value.trim());
  } catch {
    throw new Error("PWRC_PROGRAM_ID_INVALID");
  }

  const normalized = key.toBase58();
  if (POWERCHAIN_FORBIDDEN_DEPLOYMENT_PROGRAM_IDS.has(normalized)) {
    if (normalized === SOLANA_SYSTEM_PROGRAM_ID) {
      throw new Error("PWRC_SYSTEM_PROGRAM_IS_NOT_DEPLOYMENT");
    }
    throw new Error("PWRC_RESERVED_PROGRAM_IS_NOT_DEPLOYMENT");
  }

  if (
    cluster === "mainnet-beta" &&
    normalized === PWRC_FEES_DEVELOPMENT_PROGRAM_ID
  ) {
    throw new Error("PWRC_DEVELOPMENT_PROGRAM_ID_FORBIDDEN_ON_MAINNET");
  }

  return normalized;
}

export function resolvePwrcProgramId(
  cluster: SolanaCluster,
  explicit?: string,
): string {
  const value =
    explicit?.trim() ||
    (cluster === "devnet"
      ? process.env.PWRC_FEES_PROGRAM_ID_DEVNET?.trim()
      : cluster === "mainnet-beta"
        ? process.env.PWRC_FEES_PROGRAM_ID_MAINNET?.trim()
        : PWRC_FEES_DEVELOPMENT_PROGRAM_ID);

  if (!value) {
    throw new Error(`PWRC_FEES_PROGRAM_ID_REQUIRED:${cluster}`);
  }
  return assertPowerChainDeploymentProgramId(value, cluster);
}

export function resolvePwrcRpc(
  cluster: SolanaCluster,
  explicit?: string,
): string {
  const value = explicit?.trim() || process.env.PWRC_RPC_URL?.trim();
  if (value) {
    const url = new URL(value);
    if (cluster === "mainnet-beta" && url.protocol !== "https:") {
      throw new Error("PWRC_MAINNET_RPC_REQUIRES_HTTPS");
    }
    return url.toString().replace(/\/$/, "");
  }

  if (cluster === "mainnet-beta" && process.env.NODE_ENV === "production") {
    throw new Error("PWRC_PRODUCTION_DEDICATED_RPC_REQUIRED");
  }

  return SOLANA_PUBLIC_RPC[cluster];
}
