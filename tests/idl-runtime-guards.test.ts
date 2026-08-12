import test from "node:test";
import assert from "node:assert/strict";
import {
  assertVerifiedAnchorIdlRuntime,
  assertVerifiedSuiAbiRuntime,
} from "../src/idl/runtime.js";

test("Anchor runtime guard rejects missing generated-IDL verification", () => {
  assert.throws(
    () =>
      assertVerifiedAnchorIdlRuntime(
        null,
      ),
    /PWRC_GENERATED_ANCHOR_IDL_NOT_VERIFIED/,
  );
});

test("Sui runtime guard rejects unverified ABI", () => {
  assert.throws(
    () =>
      assertVerifiedSuiAbiRuntime(
        undefined,
      ),
    /WPWRC_NORMALIZED_ABI_NOT_VERIFIED/,
  );
});
