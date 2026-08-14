import {
  loadEnvironment,
} from "./index.js";

export function validateEnvironment(
  env: NodeJS.ProcessEnv =
    process.env,
) {
  const loaded =
    loadEnvironment(
      env,
    );

  const production =
    loaded.environment ===
      "production";

  if (
    production &&
    loaded.solana.cluster !==
      "mainnet-beta"
  ) {
    throw new Error(
      "PWRC_PRODUCTION_SOLANA_CLUSTER_MUST_BE_MAINNET",
    );
  }

  if (
    production &&
    loaded.sui.network !==
      "mainnet"
  ) {
    throw new Error(
      "PWRC_PRODUCTION_SUI_NETWORK_MUST_BE_MAINNET",
    );
  }

  if (
    production &&
    loaded.serviceFee.enabled &&
    !loaded.serviceFee.recipient
  ) {
    throw new Error(
      "PWRC_PRODUCTION_SERVICE_FEE_RECIPIENT_REQUIRED",
    );
  }

  if (
    loaded.bridge.executionEnabled &&
    !loaded.bridge.executorUrl
  ) {
    throw new Error(
      "PWRC_BRIDGE_EXECUTOR_URL_REQUIRED",
    );
  }

  return loaded;
}
