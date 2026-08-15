import type {
  PropsWithChildren,
} from "react";
import {
  CDPHooksProvider,
  useIsSignedIn,
  useSignInWithEmail,
  useSolanaAddress,
  useVerifyEmailOTP,
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
    <CDPHooksProvider
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
    </CDPHooksProvider>
  );
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

export function usePowerChainCdpEmailAuthentication() {
  const {
    isSignedIn,
  } =
    useIsSignedIn();
  const {
    signInWithEmail,
  } =
    useSignInWithEmail();
  const {
    verifyEmailOTP,
  } =
    useVerifyEmailOTP();

  return {
    isSignedIn,
    signInWithEmail,
    verifyEmailOTP,
  };
}
