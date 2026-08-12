import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalJsonStringify,
  sha256CanonicalJson,
} from "../src/common/serialization.js";
import {
  buildReplayKey,
} from "../src/bridge/replay.js";
import {
  BoundedRelayerQueue,
} from "../src/relayer/queue.js";
import {
  readPositiveInteger,
  readBoolean,
} from "../src/common/config.js";
import {
  assertMutableBoundary,
} from "../src/security/account-boundaries.js";

test("canonical serialization is key-order deterministic", () => {
  const a = canonicalJsonStringify({
    b: 2,
    a: 1,
    n: 3n,
  });
  const b = canonicalJsonStringify({
    n: 3n,
    a: 1,
    b: 2,
  });

  assert.equal(a, b);
  assert.equal(
    sha256CanonicalJson({ b: 2, a: 1 }),
    sha256CanonicalJson({ a: 1, b: 2 }),
  );
});

test("replay keys are domain and network separated", () => {
  assert.notEqual(
    buildReplayKey({
      domain: "solana-lock",
      network: "mainnet",
      reference: "abc",
    }),
    buildReplayKey({
      domain: "solana-lock",
      network: "testnet",
      reference: "abc",
    }),
  );
});

test("bounded queue rejects duplicates and overflow", () => {
  const queue = new BoundedRelayerQueue<number>(1);
  queue.enqueue({ id: "a", payload: 1 });

  assert.throws(
    () => queue.enqueue({ id: "a", payload: 2 }),
    /QUEUE_CAPACITY_EXCEEDED|QUEUE_DUPLICATE_ID/,
  );
});

test("strict config parsing rejects unsafe values", () => {
  assert.equal(readPositiveInteger("4", 1), 4);
  assert.equal(readBoolean("true", false), true);

  assert.throws(
    () => readPositiveInteger("4.5", 1),
    /CONFIG_INTEGER_INVALID/,
  );
  assert.throws(
    () => readBoolean("yes", false),
    /CONFIG_BOOLEAN_INVALID/,
  );
});

test("mutable boundary requires signer and writable account", () => {
  assert.throws(
    () =>
      assertMutableBoundary([
        {
          address: "state",
          writable: true,
          signer: false,
          role: "state",
        },
      ]),
    /MUTATION_SIGNER_REQUIRED/,
  );
});
