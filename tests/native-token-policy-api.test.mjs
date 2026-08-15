import test from "node:test";
import assert from "node:assert/strict";
import {
  nativePwrcPolicy,
  nativePwrcPolicySha256,
} from "../apps/api/lib/native-token.mjs";

test(
  "standalone API native policy matches golden protocol commitment",
  () => {
    const policy =
      nativePwrcPolicy();

    assert.equal(
      nativePwrcPolicySha256(),
      "af5fc80addc709e247e3604a698fa2a3efecdd94e148458aceb45cc40ea90f33",
    );
    assert.equal(
      policy.policySha256,
      "af5fc80addc709e247e3604a698fa2a3efecdd94e148458aceb45cc40ea90f33",
    );
    assert.equal(
      policy.metaplexProgramId,
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    );
    assert.equal(
      policy.publicWrites,
      false,
    );
  },
);
