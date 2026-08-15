import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateBridgeSafety,
} from "../packages/protocol/src/bridge-safety.js";

function baseRisk() {
  return {
    version:
      "1.0.0" as const,
    level:
      "NORMAL" as const,
    pauseRecommended:
      false,
    haltRequired:
      false,
    allowNewBridgeIntents:
      true,
    reasons: [],
    pendingExposureBaseUnits:
      0n,
    effectiveWrappedExposureBaseUnits:
      100n,
  };
}

test(
  "healthy bridge accepts new intents",
  () => {
    const result =
      evaluateBridgeSafety({
        phase:
          "CREATED",
        risk:
          baseRisk(),
        sourceFinalized:
          false,
        destinationFinalized:
          false,
        reconciliationVerified:
          false,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      result.acceptNewIntents,
      true,
    );
    assert.equal(
      result.allowCompletion,
      false,
    );
  },
);

test(
  "destination submission requires source finality",
  () => {
    const result =
      evaluateBridgeSafety({
        phase:
          "SOURCE_FINALIZED",
        risk:
          baseRisk(),
        sourceFinalized:
          true,
        destinationFinalized:
          false,
        reconciliationVerified:
          false,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      result.allowDestinationSubmission,
      true,
    );
  },
);

test(
  "completion requires finality, reconciliation and valid audit",
  () => {
    const healthy =
      evaluateBridgeSafety({
        phase:
          "DESTINATION_FINALIZED",
        risk:
          baseRisk(),
        sourceFinalized:
          true,
        destinationFinalized:
          true,
        reconciliationVerified:
          true,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      healthy.allowCompletion,
      true,
    );

    const invalidAudit =
      evaluateBridgeSafety({
        phase:
          "DESTINATION_FINALIZED",
        risk:
          baseRisk(),
        sourceFinalized:
          true,
        destinationFinalized:
          true,
        reconciliationVerified:
          true,
        auditChainValid:
          false,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      invalidAudit.allowCompletion,
      false,
    );
  },
);

test(
  "governance pause and risk halt block progress",
  () => {
    const haltedRisk = {
      ...baseRisk(),
      level:
        "HALT_REQUIRED" as const,
      pauseRecommended:
        true,
      haltRequired:
        true,
      allowNewBridgeIntents:
        false,
      reasons: [
        "PWRC_BRIDGE_RISK_UNDERCOLLATERALIZED",
      ],
    };

    const result =
      evaluateBridgeSafety({
        phase:
          "SOURCE_FINALIZED",
        risk:
          haltedRisk,
        sourceFinalized:
          true,
        destinationFinalized:
          false,
        reconciliationVerified:
          false,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          true,
      });

    assert.equal(
      result.acceptNewIntents,
      false,
    );
    assert.equal(
      result.allowDestinationSubmission,
      false,
    );
    assert.equal(
      result.operatorAttentionRequired,
      true,
    );
  },
);


test(
  "healthy CREATED state does not require operator attention",
  () => {
    const result =
      evaluateBridgeSafety({
        phase:
          "CREATED",
        risk:
          baseRisk(),
        sourceFinalized:
          false,
        destinationFinalized:
          false,
        reconciliationVerified:
          false,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      result.operatorAttentionRequired,
      false,
    );
    assert.deepEqual(
      result.reasons,
      [],
    );
  },
);

test(
  "impossible finality combinations require attention",
  () => {
    const result =
      evaluateBridgeSafety({
        phase:
          "SOURCE_FINALIZED",
        risk:
          baseRisk(),
        sourceFinalized:
          false,
        destinationFinalized:
          true,
        reconciliationVerified:
          true,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      result.operatorAttentionRequired,
      true,
    );
    assert.ok(
      result.reasons.includes(
        "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
      ),
    );
    assert.equal(
      result.allowDestinationSubmission,
      false,
    );
  },
);

test(
  "risk pause recommendation does not block healthy in-flight destination submission",
  () => {
    const risk = {
      ...baseRisk(),
      level:
        "PAUSE_RECOMMENDED" as const,
      pauseRecommended:
        true,
      allowNewBridgeIntents:
        false,
    };

    const result =
      evaluateBridgeSafety({
        phase:
          "SOURCE_FINALIZED",
        risk,
        sourceFinalized:
          true,
        destinationFinalized:
          false,
        reconciliationVerified:
          false,
        auditChainValid:
          true,
        recoveryRequired:
          false,
        governancePauseActive:
          false,
      });

    assert.equal(
      result.acceptNewIntents,
      false,
    );
    assert.equal(
      result.allowDestinationSubmission,
      true,
    );
    assert.equal(
      result.operatorAttentionRequired,
      false,
    );
  },
);
