import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveMainnetReleaseState,
  assertMainnetStateTransition,
} from "../scripts/mainnet/release-state.mjs";

test(
  "Mainnet release state derives sequentially",
  () => {
    assert.equal(
      deriveMainnetReleaseState({
        codeReady: true,
        buildReady: false,
        deploymentEvidenceReady:
          false,
        releaseAuthorized: false,
        authorizationConsumed:
          false,
      }),
      "SOURCE_READY",
    );

    assert.equal(
      deriveMainnetReleaseState({
        codeReady: true,
        buildReady: true,
        deploymentEvidenceReady:
          true,
        releaseAuthorized: true,
        authorizationConsumed:
          false,
      }),
      "AUTHORIZED",
    );

    assert.equal(
      deriveMainnetReleaseState({
        codeReady: true,
        buildReady: true,
        deploymentEvidenceReady:
          true,
        releaseAuthorized: true,
        authorizationConsumed:
          true,
      }),
      "CONSUMED",
    );
  },
);

test(
  "Mainnet release state cannot skip gates",
  () => {
    assert.doesNotThrow(
      () =>
        assertMainnetStateTransition(
          "BUILD_READY",
          "EVIDENCE_READY",
        ),
    );

    assert.throws(
      () =>
        assertMainnetStateTransition(
          "SOURCE_READY",
          "AUTHORIZED",
        ),
      /PWRC_MAINNET_RELEASE_STATE_TRANSITION_INVALID/,
    );
  },
);
