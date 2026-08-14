export interface PowerChainCdpUserWalletConfig {
  enabled: boolean;
  projectId: string | null;
  appName: string;
  solanaCreateOnLogin: true;
  disableAnalytics: true;
}

export function resolvePowerChainCdpUserWalletConfig(
  env:
    Record<
      string,
      string | undefined
    >,
): PowerChainCdpUserWalletConfig {
  const enabled =
    env["POWERCHAIN_CDP_USER_WALLET_ENABLED"] ===
      "true";
  const projectId =
    env["POWERCHAIN_CDP_PROJECT_ID"]
      ?.trim() ||
    null;
  const appName =
    env["POWERCHAIN_CDP_APP_NAME"]
      ?.trim() ||
    "PowerChain";

  if (
    enabled &&
    !projectId
  ) {
    throw new Error(
      "POWERCHAIN_CDP_PROJECT_ID_REQUIRED",
    );
  }

  return {
    enabled,
    projectId,
    appName,
    solanaCreateOnLogin:
      true,
    disableAnalytics:
      true,
  };
}
