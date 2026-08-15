import test from "node:test";
import assert from "node:assert/strict";
import {
  readBridgePolicyConfig,
} from "../apps/api/lib/bridge-policy-config.mjs";

const env = {
  POWERCHAIN_ENVIRONMENT:
    "production",
  POWERCHAIN_SOLANA_NETWORK:
    "mainnet-beta",
  POWERCHAIN_SUI_NETWORK:
    "mainnet",
  POWERCHAIN_BRIDGE_MAX_PENDING_EXPOSURE_BASE_UNITS:
    "1000000000",
  POWERCHAIN_BRIDGE_MAX_PENDING_OPERATIONS:
    "10",
  POWERCHAIN_BRIDGE_MAX_EVIDENCE_AGE_MS:
    "60000",
  POWERCHAIN_BRIDGE_GOVERNANCE_APPROVAL_THRESHOLD:
    "2",
  POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_TTL_MS:
    "300000",
};

test(
  "API bridge policy uses canonical protocol commitment",
  () => {
    const state =
      readBridgePolicyConfig(
        env,
      );

    assert.equal(
      state.configured,
      true,
    );
    assert.equal(
      state.policy.policySha256,
      "79ab47f08b454a061ac43b5ca021081dda0e5573ec1818535a04f7cfb4b89459",
    );
    assert.equal(
      state.policy.maxPendingExposureBaseUnits,
      "1000000000",
    );
  },
);

test(
  "API bridge policy rejects canonical supply overflow",
  () => {
    assert.throws(
      () =>
        readBridgePolicyConfig({
          ...env,
          POWERCHAIN_BRIDGE_MAX_PENDING_EXPOSURE_BASE_UNITS:
            "18446000000000000001",
        }),
      /PWRC_BRIDGE_POLICY_PENDING_EXPOSURE_INVALID/,
    );
  },
);
