import type {
  PropsWithChildren,
} from "react";
import {
  CDPReactProvider,
} from "@coinbase/cdp-react";
import {
  AuthButton,
} from "@coinbase/cdp-react/components/AuthButton";
import {
  useIsSignedIn,
  useSolanaAddress,
} from "@coinbase/cdp-hooks";
import type {
  PowerChainCdpUserWalletConfig,
} from "./index.js";

export type PowerChainCdpUserWalletProviderProps =
  PropsWithChildren<{
    config:
      PowerChainCdpUserWalletConfig;
  }>;

export function PowerChainCdpUserWalletProvider({
  config,
  children,
}: PowerChainCdpUserWalletProviderProps) {
  if (
    !config.enabled ||
    !config.projectId
  ) {
    return children;
  }

  return (
    <CDPReactProvider
      config={{
        projectId:
          config.projectId,
        appName:
          config.appName,
        disableAnalytics:
          config.disableAnalytics,
        solana: {
          createOnLogin:
            true,
        },
      }}
    >
      {children}
    </CDPReactProvider>
  );
}

export function PowerChainCdpAuthButton() {
  return <AuthButton />;
}

export function usePowerChainCdpSolanaWallet() {
  const {
    isSignedIn,
  } =
    useIsSignedIn();
  const {
    solanaAddress,
  } =
    useSolanaAddress();

  return {
    isSignedIn,
    solanaAddress:
      solanaAddress ??
      null,
    ready:
      Boolean(
        isSignedIn &&
        solanaAddress,
      ),
  };
}
