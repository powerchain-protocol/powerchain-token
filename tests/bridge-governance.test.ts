import test from "node:test";
import assert from "node:assert/strict";
import {
  approveBridgeGovernanceProposal,
  bridgeGovernanceExecutionReadiness,
  createBridgeGovernanceProposal,
} from "../packages/protocol/src/bridge-governance.js";

function proposal() {
  return createBridgeGovernanceProposal({
    action:
      "PAUSE",
    chain:
      "solana",
    target:
      null,
    proposer:
      "governor-a",
    createdAt:
      "2026-08-15T00:00:00.000Z",
    expiresAt:
      "2026-08-16T00:00:00.000Z",
    approvalThreshold:
      2,
  });
}

test(
  "governance proposal ID is deterministic",
  () => {
    const a =
      proposal();
    const b =
      proposal();

    assert.equal(
      a.proposalId,
      b.proposalId,
    );
    assert.match(
      a.proposalId,
      /^[a-f0-9]{64}$/,
    );
  },
);

test(
  "governance rejects proposer self approval and duplicate approval",
  () => {
    const p =
      proposal();

    assert.throws(
      () =>
        approveBridgeGovernanceProposal(
          p,
          "governor-a",
          "2026-08-15T01:00:00.000Z",
        ),
      /PWRC_BRIDGE_GOVERNANCE_SELF_APPROVAL_FORBIDDEN/,
    );

    const once =
      approveBridgeGovernanceProposal(
        p,
        "approver-b",
        "2026-08-15T01:00:00.000Z",
      );

    assert.throws(
      () =>
        approveBridgeGovernanceProposal(
          once,
          "approver-b",
          "2026-08-15T02:00:00.000Z",
        ),
      /PWRC_BRIDGE_GOVERNANCE_DUPLICATE_APPROVAL/,
    );
  },
);

test(
  "governance requires quorum before execution readiness",
  () => {
    let p =
      proposal();

    assert.equal(
      bridgeGovernanceExecutionReadiness(
        p,
        "2026-08-15T01:00:00.000Z",
      ).ready,
      false,
    );

    p =
      approveBridgeGovernanceProposal(
        p,
        "approver-b",
        "2026-08-15T01:00:00.000Z",
      );
    p =
      approveBridgeGovernanceProposal(
        p,
        "approver-c",
        "2026-08-15T02:00:00.000Z",
      );

    const readiness =
      bridgeGovernanceExecutionReadiness(
        p,
        "2026-08-15T03:00:00.000Z",
      );

    assert.equal(
      readiness.ready,
      true,
    );
  },
);

test(
  "governance rejects expired proposal and missing role target",
  () => {
    const p =
      proposal();

    assert.throws(
      () =>
        approveBridgeGovernanceProposal(
          p,
          "approver-b",
          "2026-08-16T00:00:00.000Z",
        ),
      /PWRC_BRIDGE_GOVERNANCE_PROPOSAL_EXPIRED/,
    );

    assert.throws(
      () =>
        createBridgeGovernanceProposal({
          action:
            "SET_OPERATOR",
          chain:
            "sui",
          target:
            null,
          proposer:
            "governor-a",
          createdAt:
            "2026-08-15T00:00:00.000Z",
          expiresAt:
            "2026-08-16T00:00:00.000Z",
          approvalThreshold:
            2,
        }),
      /PWRC_BRIDGE_GOVERNANCE_TARGET_REQUIRED/,
    );
  },
);
