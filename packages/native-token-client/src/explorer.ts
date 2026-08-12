import {
  SOLSCAN_BASE_URL,
} from "./constants.js";
import type {
  PowerChainCluster,
} from "./types/index.js";
import {
  assertSolanaAddress,
  assertSolanaSignature,
} from "./validation/solana.js";

function clusterQuery(
  cluster: PowerChainCluster,
): string {
  if (cluster === "mainnet-beta") {
    return "";
  }
  if (cluster === "devnet") {
    return "?cluster=devnet";
  }

  throw new Error(
    "SOLSCAN_LOCALNET_UNSUPPORTED",
  );
}

export const PowerChainExplorer = {
  token(
    mint: string,
    cluster: PowerChainCluster =
      "mainnet-beta",
  ): string {
    return `${SOLSCAN_BASE_URL}/token/${assertSolanaAddress(
      mint,
    )}${clusterQuery(cluster)}`;
  },

  account(
    address: string,
    cluster: PowerChainCluster =
      "mainnet-beta",
  ): string {
    return `${SOLSCAN_BASE_URL}/account/${assertSolanaAddress(
      address,
    )}${clusterQuery(cluster)}`;
  },

  transaction(
    signature: string,
    cluster: PowerChainCluster =
      "mainnet-beta",
  ): string {
    return `${SOLSCAN_BASE_URL}/tx/${assertSolanaSignature(
      signature,
    )}${clusterQuery(cluster)}`;
  },
} as const;
