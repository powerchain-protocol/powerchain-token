import {
  PWRC_GENESIS_BASE_UNITS,
} from "./constants.js";
import {
  canonicalJsonSha256,
} from "./helpers.js";

export interface BridgePolicyProfileInput {
  environment:
    string;
  solanaNetwork:
    string;
  suiNetwork:
    string;
  maxPendingExposureBaseUnits:
    bigint;
  maxPendingOperations:
    number;
  maxEvidenceAgeMs:
    number;
  governanceApprovalThreshold:
    number;
  governanceProposalTtlMs:
    number;
}

export interface BridgePolicyProfile {
  version:
    "1.0.0";
  environment:
    string;
  solanaNetwork:
    string;
  suiNetwork:
    string;
  maxPendingExposureBaseUnits:
    string;
  maxPendingOperations:
    number;
  maxEvidenceAgeMs:
    number;
  governanceApprovalThreshold:
    number;
  governanceProposalTtlMs:
    number;
  policySha256:
    string;
}

function assertLabel(
  value:
    string,
  code:
    string,
): void {
  if (
    !/^[A-Za-z0-9._:-]{2,128}$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }
}


const SOLANA_BRIDGE_NETWORKS =
  new Set([
    "localnet",
    "devnet",
    "mainnet-beta",
  ]);

const SUI_BRIDGE_NETWORKS =
  new Set([
    "localnet",
    "devnet",
    "testnet",
    "mainnet",
  ]);

function assertSolanaNetwork(
  value:
    string,
): void {
  if (
    !SOLANA_BRIDGE_NETWORKS.has(
      value,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED",
    );
  }
}

function assertSuiNetwork(
  value:
    string,
): void {
  if (
    !SUI_BRIDGE_NETWORKS.has(
      value,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED",
    );
  }
}

function assertPositiveSafeInteger(
  value:
    number,
  code:
    string,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <= 0
  ) {
    throw new Error(
      code,
    );
  }
}

export function createBridgePolicyProfile(
  input:
    BridgePolicyProfileInput,
): BridgePolicyProfile {
  assertLabel(
    input.environment,
    "PWRC_BRIDGE_POLICY_ENVIRONMENT_INVALID",
  );
  assertLabel(
    input.solanaNetwork,
    "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_INVALID",
  );
  assertSolanaNetwork(
    input.solanaNetwork,
  );
  assertLabel(
    input.suiNetwork,
    "PWRC_BRIDGE_POLICY_SUI_NETWORK_INVALID",
  );
  assertSuiNetwork(
    input.suiNetwork,
  );

  if (
    input.maxPendingExposureBaseUnits <=
      0n ||
    input.maxPendingExposureBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_PENDING_EXPOSURE_INVALID",
    );
  }

  assertPositiveSafeInteger(
    input.maxPendingOperations,
    "PWRC_BRIDGE_POLICY_PENDING_OPERATIONS_INVALID",
  );
  assertPositiveSafeInteger(
    input.maxEvidenceAgeMs,
    "PWRC_BRIDGE_POLICY_EVIDENCE_AGE_INVALID",
  );
  assertPositiveSafeInteger(
    input.governanceApprovalThreshold,
    "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_INVALID",
  );
  assertPositiveSafeInteger(
    input.governanceProposalTtlMs,
    "PWRC_BRIDGE_POLICY_GOVERNANCE_TTL_INVALID",
  );

  if (
    input.governanceApprovalThreshold <
      2
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_TOO_LOW",
    );
  }

  if (
    input.governanceApprovalThreshold >
      input.maxPendingOperations
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_EXCEEDS_OPERATIONS",
    );
  }

  if (
    input.maxEvidenceAgeMs >
      input.governanceProposalTtlMs
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_EVIDENCE_AGE_EXCEEDS_PROPOSAL_TTL",
    );
  }

  const payload = {
    version:
      "1.0.0" as const,
    environment:
      input.environment,
    solanaNetwork:
      input.solanaNetwork,
    suiNetwork:
      input.suiNetwork,
    maxPendingExposureBaseUnits:
      input
        .maxPendingExposureBaseUnits
        .toString(),
    maxPendingOperations:
      input.maxPendingOperations,
    maxEvidenceAgeMs:
      input.maxEvidenceAgeMs,
    governanceApprovalThreshold:
      input.governanceApprovalThreshold,
    governanceProposalTtlMs:
      input.governanceProposalTtlMs,
  };

  return {
    ...payload,
    policySha256:
      canonicalJsonSha256({
        domain:
          "POWERCHAIN_BRIDGE_POLICY_V1",
        policy:
          payload,
      }),
  };
}

export function assertBridgePolicyProfile(
  profile:
    BridgePolicyProfile,
): void {
  const rebuilt =
    createBridgePolicyProfile({
      environment:
        profile.environment,
      solanaNetwork:
        profile.solanaNetwork,
      suiNetwork:
        profile.suiNetwork,
      maxPendingExposureBaseUnits:
        BigInt(
          profile.maxPendingExposureBaseUnits,
        ),
      maxPendingOperations:
        profile.maxPendingOperations,
      maxEvidenceAgeMs:
        profile.maxEvidenceAgeMs,
      governanceApprovalThreshold:
        profile.governanceApprovalThreshold,
      governanceProposalTtlMs:
        profile.governanceProposalTtlMs,
    });

  if (
    rebuilt.policySha256 !==
      profile.policySha256
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_COMMITMENT_MISMATCH",
    );
  }
}
