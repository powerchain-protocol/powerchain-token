import {
  canonicalJsonSha256,
} from "./helpers.js";

export type BridgeGovernanceAction =
  | "PAUSE"
  | "UNPAUSE"
  | "SET_OPERATOR"
  | "TRANSFER_GOVERNOR";

export interface BridgeGovernanceProposalInput {
  action:
    BridgeGovernanceAction;
  chain:
    "solana" |
    "sui";
  target:
    string |
    null;
  proposer:
    string;
  createdAt:
    string;
  expiresAt:
    string;
  approvalThreshold:
    number;
}

export interface BridgeGovernanceProposal
  extends BridgeGovernanceProposalInput {
  version:
    "1.0.0";
  proposalId:
    string;
  approvals:
    readonly string[];
  executed:
    false;
}

function assertIsoTimestamp(
  value:
    string,
  code:
    string,
): number {
  const parsed =
    Date.parse(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    new Date(
      parsed,
    ).toISOString() !==
      value
  ) {
    throw new Error(
      code,
    );
  }

  return parsed;
}

function assertPrincipal(
  value:
    string,
  code:
    string,
): void {
  if (
    !value.trim() ||
    value.length >
      256
  ) {
    throw new Error(
      code,
    );
  }
}

export function createBridgeGovernanceProposal(
  input:
    BridgeGovernanceProposalInput,
): BridgeGovernanceProposal {
  assertPrincipal(
    input.proposer,
    "PWRC_BRIDGE_GOVERNANCE_PROPOSER_INVALID",
  );

  if (
    !Number.isSafeInteger(
      input.approvalThreshold,
    ) ||
    input.approvalThreshold <
      2
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_THRESHOLD_INVALID",
    );
  }

  const created =
    assertIsoTimestamp(
      input.createdAt,
      "PWRC_BRIDGE_GOVERNANCE_CREATED_AT_INVALID",
    );
  const expires =
    assertIsoTimestamp(
      input.expiresAt,
      "PWRC_BRIDGE_GOVERNANCE_EXPIRES_AT_INVALID",
    );

  if (
    expires <=
      created
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_EXPIRY_INVALID",
    );
  }

  if (
    input.action ===
      "SET_OPERATOR" ||
    input.action ===
      "TRANSFER_GOVERNOR"
  ) {
    if (
      !input.target
    ) {
      throw new Error(
        "PWRC_BRIDGE_GOVERNANCE_TARGET_REQUIRED",
      );
    }

    assertPrincipal(
      input.target,
      "PWRC_BRIDGE_GOVERNANCE_TARGET_INVALID",
    );
  } else if (
    input.target !==
      null
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_TARGET_NOT_ALLOWED",
    );
  }

  const proposalPayload = {
    version:
      "1.0.0" as const,
    action:
      input.action,
    chain:
      input.chain,
    target:
      input.target,
    proposer:
      input.proposer,
    createdAt:
      input.createdAt,
    expiresAt:
      input.expiresAt,
    approvalThreshold:
      input.approvalThreshold,
  };

  return {
    ...proposalPayload,
    proposalId:
      canonicalJsonSha256({
        domain:
          "POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_V1",
        proposal:
          proposalPayload,
      }),
    approvals: [],
    executed:
      false,
  };
}

export function approveBridgeGovernanceProposal(
  proposal:
    BridgeGovernanceProposal,
  approver:
    string,
  now:
    string,
): BridgeGovernanceProposal {
  assertPrincipal(
    approver,
    "PWRC_BRIDGE_GOVERNANCE_APPROVER_INVALID",
  );

  const nowMs =
    assertIsoTimestamp(
      now,
      "PWRC_BRIDGE_GOVERNANCE_NOW_INVALID",
    );
  const expiresMs =
    assertIsoTimestamp(
      proposal.expiresAt,
      "PWRC_BRIDGE_GOVERNANCE_EXPIRES_AT_INVALID",
    );

  if (
    nowMs >=
      expiresMs
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_PROPOSAL_EXPIRED",
    );
  }

  if (
    proposal.executed
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_ALREADY_EXECUTED",
    );
  }

  if (
    approver ===
      proposal.proposer
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_SELF_APPROVAL_FORBIDDEN",
    );
  }

  if (
    proposal.approvals.includes(
      approver,
    )
  ) {
    throw new Error(
      "PWRC_BRIDGE_GOVERNANCE_DUPLICATE_APPROVAL",
    );
  }

  return {
    ...proposal,
    approvals: [
      ...proposal.approvals,
      approver,
    ],
  };
}

export function bridgeGovernanceExecutionReadiness(
  proposal:
    BridgeGovernanceProposal,
  now:
    string,
): {
  ready:
    boolean;
  reason:
    string;
} {
  const nowMs =
    assertIsoTimestamp(
      now,
      "PWRC_BRIDGE_GOVERNANCE_NOW_INVALID",
    );
  const expiresMs =
    assertIsoTimestamp(
      proposal.expiresAt,
      "PWRC_BRIDGE_GOVERNANCE_EXPIRES_AT_INVALID",
    );

  if (
    proposal.executed
  ) {
    return {
      ready:
        false,
      reason:
        "PWRC_BRIDGE_GOVERNANCE_ALREADY_EXECUTED",
    };
  }

  if (
    nowMs >=
      expiresMs
  ) {
    return {
      ready:
        false,
      reason:
        "PWRC_BRIDGE_GOVERNANCE_PROPOSAL_EXPIRED",
    };
  }

  if (
    proposal.approvals.length <
      proposal.approvalThreshold
  ) {
    return {
      ready:
        false,
      reason:
        "PWRC_BRIDGE_GOVERNANCE_QUORUM_NOT_REACHED",
    };
  }

  return {
    ready:
      true,
    reason:
      "PWRC_BRIDGE_GOVERNANCE_READY",
  };
}
