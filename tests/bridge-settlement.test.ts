import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgeCompletionSequence,
  canTransitionBridgeSettlement,
  createBridgeIntent,
  transitionBridgeSettlement,
} from "../packages/protocol/src/bridge-settlement.js";

const input = {
  direction:
    "solana-to-sui" as const,
  sourceChainId:
    "solana:devnet",
  destinationChainId:
    "sui:devnet",
  sourceAccount:
    "source-wallet",
  destinationAccount:
    "destination-wallet",
  principalBaseUnits:
    1_000_000_000n,
  quoteFingerprint:
    "a".repeat(64),
  createdAt:
    "2026-08-15T00:00:00.000Z",
};

test(
  "bridge intent ID is deterministic",
  () => {
    const first =
      createBridgeIntent(
        input,
      );
    const second =
      createBridgeIntent(
        input,
      );

    assert.equal(
      first.intentId,
      second.intentId,
    );
    assert.match(
      first.intentId,
      /^[a-f0-9]{64}$/,
    );
    assert.equal(
      first.phase,
      "CREATED",
    );
  },
);

test(
  "settlement cannot skip source finality",
  () => {
    const intent =
      createBridgeIntent(
        input,
      );

    assert.equal(
      canTransitionBridgeSettlement(
        "CREATED",
        "DESTINATION_SUBMITTED",
      ),
      false,
    );

    assert.throws(
      () =>
        transitionBridgeSettlement(
          intent,
          "DESTINATION_SUBMITTED",
        ),
      /PWRC_BRIDGE_SETTLEMENT_TRANSITION_INVALID/,
    );
  },
);

test(
  "settlement completes only through ordered phases",
  () => {
    let intent =
      createBridgeIntent(
        input,
      );

    for (const phase of [
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "COMPLETED",
    ] as const) {
      intent =
        transitionBridgeSettlement(
          intent,
          phase,
        );
    }

    assert.equal(
      intent.phase,
      "COMPLETED",
    );

    assertBridgeCompletionSequence([
      "CREATED",
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "COMPLETED",
    ]);
  },
);

test(
  "completed settlement cannot be replayed",
  () => {
    let intent =
      createBridgeIntent(
        input,
      );

    for (const phase of [
      "SOURCE_FINALIZED",
      "DESTINATION_SUBMITTED",
      "DESTINATION_FINALIZED",
      "COMPLETED",
    ] as const) {
      intent =
        transitionBridgeSettlement(
          intent,
          phase,
        );
    }

    assert.throws(
      () =>
        transitionBridgeSettlement(
          intent,
          "DESTINATION_FINALIZED",
        ),
      /PWRC_BRIDGE_SETTLEMENT_TRANSITION_INVALID/,
    );
  },
);


test(
  "bridge intent rejects principal above canonical supply",
  () => {
    assert.throws(
      () =>
        createBridgeIntent({
          ...input,
          principalBaseUnits:
            18_446_000_000_000_000_001n,
        }),
      /PWRC_BRIDGE_INTENT_AMOUNT_INVALID/,
    );
  },
);

test(
  "bridge intent rejects direction and chain-family mismatch",
  () => {
    assert.throws(
      () =>
        createBridgeIntent({
          ...input,
          direction:
            "sui-to-solana",
        }),
      /PWRC_BRIDGE_INTENT_CHAIN_DIRECTION_MISMATCH/,
    );

    assert.throws(
      () =>
        createBridgeIntent({
          ...input,
          sourceChainId:
            "sui:devnet",
          destinationChainId:
            "sui:mainnet",
        }),
      /PWRC_BRIDGE_INTENT_CHAIN_DIRECTION_MISMATCH/,
    );
  },
);
