import assert from "node:assert/strict";
import {
  MAX_BUFFER_BYTES,
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
} from "./index.mjs";

assert.equal(
  toBigIntBE(
    Buffer.from(
      "deadbeef",
      "hex",
    ),
  ),
  0xdeadbeefn,
);

assert.equal(
  toBigIntLE(
    Buffer.from(
      "deadbeef",
      "hex",
    ),
  ),
  0xefbeadden,
);

assert.equal(
  toBufferBE(
    0xdeadbeefn,
    8,
  ).toString("hex"),
  "00000000deadbeef",
);

assert.equal(
  toBufferLE(
    0xdeadbeefn,
    8,
  ).toString("hex"),
  "efbeadde00000000",
);

assert.throws(
  () =>
    toBigIntLE(
      Buffer.alloc(
        MAX_BUFFER_BYTES + 1,
      ),
    ),
  RangeError,
);

assert.throws(
  () =>
    toBufferLE(
      1n,
      MAX_BUFFER_BYTES + 1,
    ),
  RangeError,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      version:
        "1.0.0",
      implementation:
        "pure-js-memory-safe",
      nativeAddon:
        false,
      maxBufferBytes:
        MAX_BUFFER_BYTES,
    },
    null,
    2,
  ),
);
