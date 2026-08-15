export function bridgeGovernancePolicy() {
  return {
    version:
      "1.0.0",
    publicWrites:
      false,
    actions: [
      "PAUSE",
      "UNPAUSE",
      "SET_OPERATOR",
      "TRANSFER_GOVERNOR",
    ],
    rules: {
      minimumApprovalThreshold:
        2,
      proposerSelfApproval:
        false,
      duplicateApproval:
        false,
      proposalExpiryRequired:
        true,
      targetRequiredForRoleChanges:
        true,
      targetForbiddenForPauseActions:
        true,
      executionRequiresQuorum:
        true,
      executionRequiresExplicitSignerFlow:
        true,
      publicAdminWrites:
        false,
    },
  };
}
