import crypto from "node:crypto";

const PWRC_GENESIS_BASE_UNITS =
  18_446_000_000_000_000_000n;

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

function canonicalJson(
  value,
) {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    if (
      typeof value ===
        "bigint"
    ) {
      return JSON.stringify(
        value.toString(),
      );
    }

    return JSON.stringify(
      value,
    );
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return `[${value
      .map(
        canonicalJson,
      )
      .join(",")}]`;
  }

  return `{${Object
    .keys(value)
    .sort()
    .filter(
      (key) =>
        value[key] !==
        undefined,
    )
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(value[key])}`,
    )
    .join(",")}}`;
}

function canonicalJsonSha256(
  value,
) {
  return crypto
    .createHash(
      "sha256",
    )
    .update(
      canonicalJson(
        value,
      ),
    )
    .digest(
      "hex",
    );
}

function parsePositiveInteger(
  value,
  key,
) {
  if (
    !/^[1-9][0-9]*$/.test(
      value ?? "",
    )
  ) {
    throw new Error(
      `PWRC_BRIDGE_POLICY_ENV_INVALID:${key}`,
    );
  }

  const parsed =
    Number(
      value,
    );

  if (
    !Number.isSafeInteger(
      parsed,
    )
  ) {
    throw new Error(
      `PWRC_BRIDGE_POLICY_ENV_INVALID:${key}`,
    );
  }

  return parsed;
}

function parsePositiveBigInt(
  value,
  key,
) {
  if (
    !/^[1-9][0-9]*$/.test(
      value ?? "",
    )
  ) {
    throw new Error(
      `PWRC_BRIDGE_POLICY_ENV_INVALID:${key}`,
    );
  }

  return BigInt(
    value,
  );
}

function parseLabel(
  value,
  key,
) {
  if (
    !/^[A-Za-z0-9._:-]{2,128}$/.test(
      value ?? "",
    )
  ) {
    throw new Error(
      `PWRC_BRIDGE_POLICY_ENV_INVALID:${key}`,
    );
  }

  return value;
}

function buildBridgePolicy(
  input,
) {
  if (
    !SOLANA_BRIDGE_NETWORKS.has(
      input.solanaNetwork,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED",
    );
  }

  if (
    !SUI_BRIDGE_NETWORKS.has(
      input.suiNetwork,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED",
    );
  }

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

  if (
    input.governanceApprovalThreshold <
      2
  ) {
    throw new Error(
      "PWRC_BRIDGE_POLICY_ENV_GOVERNANCE_THRESHOLD_TOO_LOW",
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
      "1.0.0",
    environment:
      input.environment,
    solanaNetwork:
      input.solanaNetwork,
    suiNetwork:
      input.suiNetwork,
    maxPendingExposureBaseUnits:
      input.maxPendingExposureBaseUnits
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

export function readBridgePolicyConfig(
  env =
    process.env,
) {
  const required = [
    "POWERCHAIN_ENVIRONMENT",
    "POWERCHAIN_SOLANA_NETWORK",
    "POWERCHAIN_SUI_NETWORK",
    "POWERCHAIN_BRIDGE_MAX_PENDING_EXPOSURE_BASE_UNITS",
    "POWERCHAIN_BRIDGE_MAX_PENDING_OPERATIONS",
    "POWERCHAIN_BRIDGE_MAX_EVIDENCE_AGE_MS",
    "POWERCHAIN_BRIDGE_GOVERNANCE_APPROVAL_THRESHOLD",
    "POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_TTL_MS",
  ];

  const missing =
    required.filter(
      (key) =>
        !env[key]?.trim(),
    );

  if (
    missing.length
  ) {
    return {
      configured:
        false,
      failClosed:
        true,
      missing,
      policy:
        null,
    };
  }

  const governanceApprovalThreshold =
    parsePositiveInteger(
      env.POWERCHAIN_BRIDGE_GOVERNANCE_APPROVAL_THRESHOLD,
      "POWERCHAIN_BRIDGE_GOVERNANCE_APPROVAL_THRESHOLD",
    );

  const policy =
    buildBridgePolicy({
      environment:
        parseLabel(
          env.POWERCHAIN_ENVIRONMENT,
          "POWERCHAIN_ENVIRONMENT",
        ),
      solanaNetwork:
        parseLabel(
          env.POWERCHAIN_SOLANA_NETWORK,
          "POWERCHAIN_SOLANA_NETWORK",
        ),
      suiNetwork:
        parseLabel(
          env.POWERCHAIN_SUI_NETWORK,
          "POWERCHAIN_SUI_NETWORK",
        ),
      maxPendingExposureBaseUnits:
        parsePositiveBigInt(
          env.POWERCHAIN_BRIDGE_MAX_PENDING_EXPOSURE_BASE_UNITS,
          "POWERCHAIN_BRIDGE_MAX_PENDING_EXPOSURE_BASE_UNITS",
        ),
      maxPendingOperations:
        parsePositiveInteger(
          env.POWERCHAIN_BRIDGE_MAX_PENDING_OPERATIONS,
          "POWERCHAIN_BRIDGE_MAX_PENDING_OPERATIONS",
        ),
      maxEvidenceAgeMs:
        parsePositiveInteger(
          env.POWERCHAIN_BRIDGE_MAX_EVIDENCE_AGE_MS,
          "POWERCHAIN_BRIDGE_MAX_EVIDENCE_AGE_MS",
        ),
      governanceApprovalThreshold,
      governanceProposalTtlMs:
        parsePositiveInteger(
          env.POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_TTL_MS,
          "POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_TTL_MS",
        ),
    });

  return {
    configured:
      true,
    failClosed:
      false,
    missing: [],
    policy,
  };
}

export function bridgePolicyConfigSurface(
  env =
    process.env,
) {
  const state =
    readBridgePolicyConfig(
      env,
    );

  return {
    version:
      "1.0.0",
    configured:
      state.configured,
    failClosed:
      state.failClosed,
    missing:
      state.missing,
    policy:
      state.policy,
    policySha256:
      state.policy
        ?.policySha256 ??
      null,
    secretsExposed:
      false,
    publicWrites:
      false,
  };
}
