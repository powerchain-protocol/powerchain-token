import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgePolicyProfile,
  createBridgePolicyProfile,
} from "../packages/protocol/src/bridge-policy.js";

const input = {
  environment:
    "production",
  solanaNetwork:
    "mainnet-beta",
  suiNetwork:
    "mainnet",
  maxPendingExposureBaseUnits:
    1_000_000_000_000n,
  maxPendingOperations:
    100,
  maxEvidenceAgeMs:
    120_000,
  governanceApprovalThreshold:
    2,
  governanceProposalTtlMs:
    86_400_000,
};

test(
  "bridge policy commitment is deterministic",
  () => {
    const a =
      createBridgePolicyProfile(
        input,
      );
    const b =
      createBridgePolicyProfile(
        input,
      );

    assert.equal(
      a.policySha256,
      b.policySha256,
    );
    assert.match(
      a.policySha256,
      /^[a-f0-9]{64}$/,
    );
  },
);

test(
  "bridge policy rejects governance threshold below two",
  () => {
    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...input,
          governanceApprovalThreshold:
            1,
        }),
      /PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_TOO_LOW/,
    );
  },
);

test(
  "bridge policy commitment detects tampering",
  () => {
    const policy =
      createBridgePolicyProfile(
        input,
      );

    assert.throws(
      () =>
        assertBridgePolicyProfile({
          ...policy,
          maxPendingOperations:
            101,
        }),
      /PWRC_BRIDGE_POLICY_COMMITMENT_MISMATCH/,
    );
  },
);

test(
  "bridge policy rejects zero pending exposure threshold",
  () => {
    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...input,
          maxPendingExposureBaseUnits:
            0n,
        }),
      /PWRC_BRIDGE_POLICY_PENDING_EXPOSURE_INVALID/,
    );
  },
);


test(
  "rejects exposure above canonical PWRC supply",
  () => {
    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...base,
          maxPendingExposureBaseUnits:
            18_446_000_000_000_000_001n,
        }),
      /PWRC_BRIDGE_POLICY_PENDING_EXPOSURE_INVALID/,
    );
  },
);

test(
  "rejects unsupported bridge network labels",
  () => {
    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...base,
          solanaNetwork:
            "testnet",
        }),
      /PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED/,
    );

    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...base,
          suiNetwork:
            "canary",
        }),
      /PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED/,
    );
  },
);

test(
  "rejects logically inconsistent thresholds",
  () => {
    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...base,
          maxPendingOperations:
            2,
          governanceApprovalThreshold:
            3,
        }),
      /PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_EXCEEDS_OPERATIONS/,
    );

    assert.throws(
      () =>
        createBridgePolicyProfile({
          ...base,
          maxEvidenceAgeMs:
            600_000,
          governanceProposalTtlMs:
            300_000,
        }),
      /PWRC_BRIDGE_POLICY_EVIDENCE_AGE_EXCEEDS_PROPOSAL_TTL/,
    );
  },
);
