import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_RUNTIME_POLICY, assertRuntimePolicy } from "../src/config/runtime.js";

test("production runtime disables blind write retries", () => {
  assert.equal(DEFAULT_RUNTIME_POLICY.blindWriteRetries, false);
  assert.doesNotThrow(() => assertRuntimePolicy(DEFAULT_RUNTIME_POLICY));
});
