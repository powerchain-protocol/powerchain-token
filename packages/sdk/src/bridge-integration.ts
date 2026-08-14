import {
  assertBridgeConservation,
  quoteSolanaToSuiBridge,
} from "../../protocol/src/bridge.js";
import {
  createPowerChainSolanaClients,
} from "./solana-client.js";
import {
  createPowerChainSuiTransportConfig,
  requireWpwrcDeployment,
} from "./sui-client.js";

export interface BridgeIntegrationConfig {
  solanaCluster:
    "localnet" |
    "devnet" |
    "mainnet-beta";
  suiNetwork:
    "localnet" |
    "devnet" |
    "testnet" |
    "mainnet";
  env?:
    NodeJS.ProcessEnv;
}

export function createBridgeIntegration(
  input:
    BridgeIntegrationConfig,
) {
  const env =
    input.env ??
    process.env;

  return {
    solana:
      createPowerChainSolanaClients({
        cluster:
          input.solanaCluster,
        env,
      }),
    sui:
      createPowerChainSuiTransportConfig({
        network:
          input.suiNetwork,
        env,
      }),
    deployment:
      input.suiNetwork ===
        "mainnet" ||
      env[
        "WPWRC_SUI_PACKAGE_ID"
      ]?.trim()
        ? requireWpwrcDeployment({
            network:
              input.suiNetwork,
            env,
          })
        : null,
    quoteSolanaToSuiBridge,
    assertBridgeConservation,
  };
}
