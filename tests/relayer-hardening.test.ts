import test from "node:test";
import assert from "node:assert/strict";
import {
  assertRelayerTransition,
} from "../src/relayer/state.js";
import {
  buildBridgeIdempotencyKey,
} from "../src/relayer/idempotency.js";
import {
  decideRelayerRetry,
} from "../src/relayer/retry.js";
import {
  evaluateConservationSnapshot,
} from "../src/bridge/watcher.js";

test("relayer requires conservation before authorization", () => {
  assert.throws(
    () =>
      assertRelayerTransition(
        "IDENTITY_VERIFIED",
        "AUTHORIZED",
      ),
    /PWRC_RELAYER_INVALID_TRANSITION/,
  );
});

test("bridge idempotency key is deterministic and cryptographic", () => {
  const a = buildBridgeIdempotencyKey({
    direction: "solana-to-sui",
    sourceReference: "receipt-1",
  });
  const b = buildBridgeIdempotencyKey({
    direction: "solana-to-sui",
    sourceReference: "receipt-1",
  });
  assert.equal(a, b);
  assert.match(a, /^[a-f0-9]{64}$/);
});

test("ambiguous write result is not blindly retried", () => {
  assert.deepEqual(
    decideRelayerRetry({
      currentAttempt: 1,
      writeMayHaveLanded: true,
      idempotencyConfirmed: false,
    }),
    {
      retry: false,
      deadLetter: false,
      nextAttempt: 2,
    },
  );
});

test("conservation watcher blocks undercollateralized state", () => {
  const result = evaluateConservationSnapshot({
    observedAt: "2027-04-01T00:00:00Z",
    solanaSlot: 100n,
    suiCheckpoint: 200n,
    canonicalLiveSupplyBaseUnits: 10_000n,
    lockedCanonicalBaseUnits: 999n,
    suiWrappedSupplyBaseUnits: 1n,
    pendingSolanaToSuiCanonicalBaseUnits: 0n,
    pendingSuiToSolanaCanonicalBaseUnits: 0n,
  });

  assert.equal(result.healthy, false);
  assert.match(
    result.errors.join(","),
    /WRAPPED_EXPOSURE_EXCEEDS_LOCKED_CANONICAL/,
  );
});
