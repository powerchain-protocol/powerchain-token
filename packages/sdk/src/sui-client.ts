import {
  loadWpwrcDeployment,
  resolveSuiRpc,
  resolveSuiSecondaryRpc,
  resolveSuiWebSocket,
  type SuiNetwork,
  type WpwrcDeployment,
} from "@powerchain/protocol/sui";

export interface PowerChainSuiClientConfig {
  network:
    SuiNetwork;
  env?:
    NodeJS.ProcessEnv;
}

/**
 * Sui transport config is kept SDK-neutral so the current @mysten/sui client
 * can be instantiated by the application without leaking secrets/config into
 * browser bundles.
 */
export function createPowerChainSuiTransportConfig(
  input:
    PowerChainSuiClientConfig,
) {
  const env =
    input.env ??
    process.env;

  return {
    network:
      input.network,
    rpcUrl:
      resolveSuiRpc(
        input.network,
        env,
      ),
    secondaryRpcUrl:
      resolveSuiSecondaryRpc(
        input.network,
        env,
      ),
    wsUrl:
      resolveSuiWebSocket(
        input.network,
        env,
      ),
  };
}

export function requireWpwrcDeployment(
  input:
    PowerChainSuiClientConfig,
): WpwrcDeployment {
  return loadWpwrcDeployment(
    input.network,
    input.env ??
      process.env,
  );
}
