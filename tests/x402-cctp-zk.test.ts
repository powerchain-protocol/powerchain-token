import test from "node:test";
import assert from "node:assert/strict";
import { assertCctpIntent, PWRC_CCTP_POLICY } from "../packages/protocol/src/cctp/policy.js";
import { assertCanonicalPwrcZkMode } from "../packages/protocol/src/zk/policy.js";
import { PWRC_X402_POLICY } from "../packages/protocol/src/x402/policy.js";

test("CCTP is USDC-only in PWRC architecture", () => {
  assert.equal(PWRC_CCTP_POLICY.asset, "USDC");
  assert.equal(PWRC_CCTP_POLICY.allowPwrc, false);
});

test("CCTP rejects same source and destination domain", () => {
  assert.throws(
    () => assertCctpIntent({
      sourceDomain: 5,
      destinationDomain: 5,
      amountUsdcBaseUnits: 1n,
      recipient: "recipient",
    }),
    /CCTP_SAME_DOMAIN/,
  );
});

test("x402 defaults to USDC and does not auto-enable PWRC", () => {
  assert.equal(PWRC_X402_POLICY.defaultAsset, "USDC");
  assert.equal(PWRC_X402_POLICY.allowPwrcExperimental, false);
});

test("canonical PWRC confidential transfers remain disabled", () => {
  assert.doesNotThrow(() => assertCanonicalPwrcZkMode("disabled"));
  assert.throws(
    () => assertCanonicalPwrcZkMode("confidential-transfer-experimental"),
    /PWRC_CANONICAL_CONFIDENTIAL_TRANSFER_NOT_ENABLED/,
  );
});
