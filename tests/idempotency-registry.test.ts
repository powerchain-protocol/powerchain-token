import test from "node:test";
import assert from "node:assert/strict";
import {
  createBoundedIdempotencyRegistry,
} from "../packages/sdk/src/idempotency-registry.js";

test(
  "idempotency registry rejects replay until expiry",
  () => {
    const registry =
      createBoundedIdempotencyRegistry({
        ttlMs:
          60_000,
        maxEntries:
          100,
      });

    registry.claim(
      "request-12345678",
      1_000,
    );

    assert.equal(
      registry.has(
        "request-12345678",
        2_000,
      ),
      true,
    );

    assert.throws(
      () =>
        registry.claim(
          "request-12345678",
          2_000,
        ),
      /PWRC_IDEMPOTENCY_REPLAY/,
    );

    assert.equal(
      registry.has(
        "request-12345678",
        61_001,
      ),
      false,
    );
  },
);

test(
  "idempotency registry is bounded",
  () => {
    assert.throws(
      () =>
        createBoundedIdempotencyRegistry({
          ttlMs:
            60_000,
          maxEntries:
            99,
        }),
      /PWRC_IDEMPOTENCY_MAX_ENTRIES_INVALID/,
    );
  },
);


test(
  "idempotency registry rejects invalid clocks and expiry overflow",
  () => {
    const registry =
      createBoundedIdempotencyRegistry({
        ttlMs:
          60_000,
        maxEntries:
          100,
      });

    for (const now of [
      Number.NaN,
      -1,
      Number.MAX_SAFE_INTEGER,
    ]) {
      assert.throws(
        () =>
          registry.claim(
            "request-12345678",
            now,
          ),
        /PWRC_IDEMPOTENCY_CLOCK_INVALID/,
      );
    }
  },
);
