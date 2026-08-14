import { PublicKey } from "@solana/web3.js";
import {
  resolveProgramId,
  resolveRpc,
  resolveSecondaryRpc,
  resolveWebSocket,
  type SolanaCluster,
} from "../packages/protocol/src/solana.js";
import {
  resolveSuiRpc,
  resolveSuiSecondaryRpc,
  resolveSuiWebSocket,
  type SuiNetwork,
} from "../packages/protocol/src/sui.js";

function bool(
  value: string | undefined,
  fallback = false,
): boolean {
  if (!value) return fallback;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error("PWRC_ENV_BOOLEAN_INVALID");
}

function bps(
  value: string | undefined,
): number {
  const parsed =
    Number(value ?? "250");
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0 ||
    parsed > 10_000
  ) {
    throw new Error(
      "PWRC_SERVICE_FEE_BPS_INVALID",
    );
  }
  return parsed;
}

function publicKeyOrNull(
  value: string | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    return new PublicKey(raw).toBase58();
  } catch {
    throw new Error(
      "PWRC_SERVICE_FEE_RECIPIENT_INVALID",
    );
  }
}

function solanaCluster(
  value: string | undefined,
): SolanaCluster {
  const cluster =
    value ?? "localnet";
  if (
    cluster !== "localnet" &&
    cluster !== "devnet" &&
    cluster !== "mainnet-beta"
  ) {
    throw new Error(
      "PWRC_CLUSTER_INVALID",
    );
  }
  return cluster;
}

function suiNetwork(
  value: string | undefined,
): SuiNetwork {
  const network =
    value ?? "devnet";
  if (
    ![
      "localnet",
      "devnet",
      "testnet",
      "mainnet",
    ].includes(network)
  ) {
    throw new Error(
      "PWRC_SUI_NETWORK_INVALID",
    );
  }
  return network as SuiNetwork;
}

export function loadEnvironment(
  env: NodeJS.ProcessEnv =
    process.env,
) {
  const cluster =
    solanaCluster(
      env["PWRC_CLUSTER"],
    );
  const sui =
    suiNetwork(
      env["SUI_NETWORK"],
    );

  const serviceFeeEnabled =
    bool(
      env[
        "PWRC_SERVICE_FEE_ENABLED"
      ],
      false,
    );
  const serviceFeeRecipient =
    publicKeyOrNull(
      env[
        "PWRC_SERVICE_FEE_RECIPIENT"
      ],
    );

  if (
    serviceFeeEnabled &&
    !serviceFeeRecipient
  ) {
    throw new Error(
      "PWRC_SERVICE_FEE_RECIPIENT_REQUIRED",
    );
  }

  const bridgeExecutionEnabled =
    bool(
      env[
        "PWRC_BRIDGE_EXECUTION_ENABLED"
      ],
      false,
    );

  if (
    bridgeExecutionEnabled &&
    !env[
      "PWRC_BRIDGE_EXECUTOR_URL"
    ]?.trim()
  ) {
    throw new Error(
      "PWRC_BRIDGE_EXECUTOR_URL_REQUIRED",
    );
  }

  return {
    version:
      "1.0.0" as const,
    environment:
      env["NODE_ENV"] ??
      "development",
    solana: {
      cluster,
      rpcUrl:
        resolveRpc(
          cluster,
          env,
        ),
      secondaryRpcUrl:
        resolveSecondaryRpc(
          cluster,
          env,
        ),
      wsUrl:
        resolveWebSocket(
          cluster,
          env,
        ),
      pwrcLockProgramId:
        resolveProgramId(
          "pwrc-lock",
          cluster,
          env,
        ),
      pwrcTokenProgramId:
        resolveProgramId(
          "pwrc-token",
          cluster,
          env,
        ),
    },
    sui: {
      network:
        sui,
      rpcUrl:
        resolveSuiRpc(
          sui,
          env,
        ),
      secondaryRpcUrl:
        resolveSuiSecondaryRpc(
          sui,
          env,
        ),
      wsUrl:
        resolveSuiWebSocket(
          sui,
          env,
        ),
    },
    serviceFee: {
      enabled:
        serviceFeeEnabled,
      basisPoints:
        bps(
          env[
            "PWRC_SERVICE_FEE_BPS"
          ],
        ),
      recipient:
        serviceFeeRecipient,
      asset:
        "PWRC" as const,
    },
    bridge: {
      executionEnabled:
        bridgeExecutionEnabled,
      executorUrl:
        env[
          "PWRC_BRIDGE_EXECUTOR_URL"
        ]?.trim() ||
        null,
    },
  };
}
