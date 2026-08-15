import test from "node:test";
import assert from "node:assert/strict";
import {
  nativePwrcPolicyPayload,
  nativePwrcPolicySha256,
} from "../packages/protocol/src/native-token-policy.js";

test(
  "canonical native PWRC policy has stable commitment",
  () => {
    const policy =
      nativePwrcPolicyPayload();

    assert.equal(
      policy.version,
      "1.0.0",
    );
    assert.equal(
      policy.standard,
      "Token-2022",
    );
    assert.equal(
      policy.publicWrites,
      false,
    );
    assert.equal(
      nativePwrcPolicySha256(),
      "af5fc80addc709e247e3604a698fa2a3efecdd94e148458aceb45cc40ea90f33",
    );
  },
);
