import test from "node:test";
import assert from "node:assert/strict";
import {
  bridgeEvidenceRequirements,
  buildBridgeExecutionPlan,
} from "../packages/protocol/src/bridge-plan.js";
import {
  createBridgeIntent,
} from "../packages/protocol/src/bridge-settlement.js";

function intent(
  direction:
    "solana-to-sui" |
    "sui-to-solana",
) {
  return createBridgeIntent({
    direction,
    sourceChainId:
      direction ===
        "solana-to-sui"
        ? "solana:devnet"
        : "sui:devnet",
    destinationChainId:
      direction ===
        "solana-to-sui"
        ? "sui:devnet"
        : "solana:devnet",
    sourceAccount:
      "source-account",
    destinationAccount:
      "destination-account",
    principalBaseUnits:
      1_000_000_000n,
    quoteFingerprint:
      "b".repeat(64),
    createdAt:
      "2026-08-15T00:00:00.000Z",
  });
}

test(
  "bridge plan orders write steps behind preparation and finality",
  () => {
    const plan =
      buildBridgeExecutionPlan(
        intent(
          "solana-to-sui",
        ),
      );

    assert.equal(
      plan.steps.length,
      7,
    );
    assert.deepEqual(
      plan.steps
        .filter(
          (step) =>
            step.monetaryWrite,
        )
        .map(
          (step) =>
            step.kind,
        ),
      [
        "SOURCE_SUBMIT",
        "DESTINATION_SUBMIT",
      ],
    );
    assert.equal(
      plan.blindRetry,
      false,
    );
    assert.equal(
      plan.publicApiWrites,
      false,
    );
  },
);

test(
  "Sui to Solana execution plan flips source and destination chains",
  () => {
    const plan =
      buildBridgeExecutionPlan(
        intent(
          "sui-to-solana",
        ),
      );

    assert.equal(
      plan.sourceChain,
      "sui",
    );
    assert.equal(
      plan.destinationChain,
      "solana",
    );
  },
);

test(
  "bridge plan requires a fresh CREATED intent",
  () => {
    const created =
      intent(
        "solana-to-sui",
      );

    assert.throws(
      () =>
        buildBridgeExecutionPlan({
          ...created,
          phase:
            "SOURCE_FINALIZED",
        }),
      /PWRC_BRIDGE_PLAN_REQUIRES_CREATED_INTENT/,
    );
  },
);

test(
  "evidence requirements are chain-direction specific",
  () => {
    const forward =
      bridgeEvidenceRequirements(
        "solana-to-sui",
      );
    const reverse =
      bridgeEvidenceRequirements(
        "sui-to-solana",
      );

    assert.ok(
      forward[0]
        ?.required
        .includes(
          "solanaFinalizedSlot",
        ),
    );
    assert.ok(
      reverse[0]
        ?.required
        .includes(
          "suiCheckpoint",
        ),
    );
    assert.ok(
      forward[2]
        ?.required
        .includes(
          "reconciliationSha256",
        ),
    );
  },
);
