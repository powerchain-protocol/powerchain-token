import { PublicKey } from "@solana/web3.js";
import { normalizeRpcUrl } from "./common/urls.js";

export const SOLANA_SYSTEM_PROGRAM_ID = "11111111111111111111111111111111" as const;
export const SOLANA_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as const;
export const SOLANA_TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" as const;
export const SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as const;
export const METAPLEX_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as const;

export const PWRC_LOCK_LOCALNET_PROGRAM_ID =
  "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr" as const;
export const PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID =
  "HRrDxwZzuFreRmkCLY9oFXNGAy2gjd3diHyyTadxd8s6" as const;

export type SolanaCluster = "localnet" | "devnet" | "mainnet-beta";
export type PowerChainProgramKind = "pwrc-lock" | "pwrc-token";

export const SOLANA_PUBLIC_RPC: Record<SolanaCluster, string> = {
  localnet: "http://127.0.0.1:8899",
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet.solana.com",
};

export const POWERCHAIN_FORBIDDEN_DEPLOYMENT_PROGRAM_IDS = new Set<string>([
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
    throw new Error(
      normalized === SOLANA_SYSTEM_PROGRAM_ID
        ? "PWRC_SYSTEM_PROGRAM_IS_NOT_DEPLOYMENT"
        : "PWRC_RESERVED_PROGRAM_IS_NOT_DEPLOYMENT",
    );
  }
  if (
    cluster === "mainnet-beta" &&
    (normalized === PWRC_LOCK_LOCALNET_PROGRAM_ID ||
      normalized === PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID)
  ) {
    throw new Error("PWRC_LOCAL_PROGRAM_ID_FORBIDDEN_ON_MAINNET");
  }
  return normalized;
}

export function resolvePowerChainProgramId(
  kind: PowerChainProgramKind,
  cluster: SolanaCluster,
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const local =
    kind === "pwrc-lock"
      ? PWRC_LOCK_LOCALNET_PROGRAM_ID
      : PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID;
  const prefix = kind === "pwrc-lock" ? "PWRC_LOCK_PROGRAM_ID" : "PWRC_TOKEN_PROGRAM_ID";
  const suffix = cluster === "mainnet-beta" ? "MAINNET" : "DEVNET";
  const value = explicit?.trim() || (cluster === "localnet" ? local : env[`${prefix}_${suffix}`]?.trim());
  if (!value) throw new Error(`POWERCHAIN_PROGRAM_ID_REQUIRED:${kind}:${cluster}`);
  return assertPowerChainDeploymentProgramId(value, cluster);
}

/** @deprecated Use resolvePowerChainProgramId("pwrc-lock", ...). */
export function resolvePwrcProgramId(cluster: SolanaCluster, explicit?: string): string {
  return resolvePowerChainProgramId("pwrc-lock", cluster, explicit);
}

export function resolvePwrcRpc(
  cluster: SolanaCluster,
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const value = explicit?.trim() || env.PWRC_RPC_URL?.trim() || env.PWRC_MAINNET_RPC_URL?.trim();
  if (value) return normalizeRpcUrl(value, cluster === "mainnet-beta");
  if (cluster === "mainnet-beta" && env.NODE_ENV === "production") {
    throw new Error("PWRC_PRODUCTION_DEDICATED_RPC_REQUIRED");
  }
  return SOLANA_PUBLIC_RPC[cluster];
}
