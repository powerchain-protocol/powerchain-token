import test from "node:test";
import assert from "node:assert/strict";
import {
  resolvePowerChainCdpUserWalletConfig,
} from "../packages/cdp-user-wallet/src/index.js";

test("CDP user wallet is disabled by default",()=>{
  const config =
    resolvePowerChainCdpUserWalletConfig({});

  assert.equal(config.enabled,false);
  assert.equal(config.projectId,null);
  assert.equal(config.appName,"PowerChain");
  assert.equal(config.solanaCreateOnLogin,true);
  assert.equal(config.disableAnalytics,true);
});

test("CDP user wallet requires project ID when enabled",()=>{
  assert.throws(
    () =>
      resolvePowerChainCdpUserWalletConfig({
        POWERCHAIN_CDP_USER_WALLET_ENABLED:"true",
      }),
    /POWERCHAIN_CDP_PROJECT_ID_REQUIRED/,
  );
});

test("CDP user wallet accepts public project configuration",()=>{
  const config =
    resolvePowerChainCdpUserWalletConfig({
      POWERCHAIN_CDP_USER_WALLET_ENABLED:"true",
      POWERCHAIN_CDP_PROJECT_ID:"project-123",
      POWERCHAIN_CDP_APP_NAME:"PowerChain",
    });

  assert.equal(config.enabled,true);
  assert.equal(config.projectId,"project-123");
  assert.equal(config.appName,"PowerChain");
});
