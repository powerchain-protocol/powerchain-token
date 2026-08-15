import {
  Connection,
  PublicKey,
  type Commitment,
} from "@solana/web3.js";
import {
  resolveProgramId,
  resolveRpc,
  resolveSecondaryRpc,
  resolveWebSocket,
  type SolanaCluster,
} from "@powerchain/protocol/solana";
import {
  PWRC_CANONICAL_MINT,
} from "@powerchain/protocol/constants";
import {
  nativePwrcTransferPreview,
  verifyNativePwrcMintObservation,
} from "@powerchain/protocol/native-token";

export interface PowerChainSolanaClientConfig {
  cluster: SolanaCluster;
  commitment?: Commitment;
  env?: NodeJS.ProcessEnv;
}

export function createPowerChainSolanaClients(
  input: PowerChainSolanaClientConfig,
) {
  const env =
    input.env ??
    process.env;
  const commitment =
    input.commitment ??
    "finalized";

  const rpcUrl =
    resolveRpc(
      input.cluster,
      env,
    );
  const wsEndpoint =
    resolveWebSocket(
      input.cluster,
      env,
    );
  const secondaryRpcUrl =
    resolveSecondaryRpc(
      input.cluster,
      env,
    );

  const primary =
    new Connection(
      rpcUrl,
      {
        commitment,
        wsEndpoint,
      },
    );

  const secondary =
    secondaryRpcUrl
      ? new Connection(
          secondaryRpcUrl,
          commitment,
        )
      : null;

  return {
    cluster:
      input.cluster,
    canonicalMint:
      new PublicKey(
        PWRC_CANONICAL_MINT,
      ),
    pwrcTokenProgramId:
      new PublicKey(
        resolveProgramId(
          "pwrc-token",
          input.cluster,
          env,
        ),
      ),
    pwrcLockProgramId:
      new PublicKey(
        resolveProgramId(
          "pwrc-lock",
          input.cluster,
          env,
        ),
      ),
    primary,
    secondary,
    verifyNativePwrcMintObservation,
    nativePwrcTransferPreview,
  };
}


export function createPowerChainSolanaReadConnections(
  input:
    PowerChainSolanaClientConfig,
) {
  const env =
    input.env ??
    process.env;
  const commitment =
    input.commitment ??
    "finalized";
  const rpcUrl =
    resolveRpc(
      input.cluster,
      env,
    );
  const wsEndpoint =
    resolveWebSocket(
      input.cluster,
      env,
    );
  const secondaryRpcUrl =
    resolveSecondaryRpc(
      input.cluster,
      env,
    );

  return {
    cluster:
      input.cluster,
    canonicalMint:
      new PublicKey(
        PWRC_CANONICAL_MINT,
      ),
    primary:
      new Connection(
        rpcUrl,
        {
          commitment,
          wsEndpoint,
        },
      ),
    secondary:
      secondaryRpcUrl
        ? new Connection(
            secondaryRpcUrl,
            commitment,
          )
        : null,
    secondaryConfigured:
      secondaryRpcUrl !==
      null,
  };
}
