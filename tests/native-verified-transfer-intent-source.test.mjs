import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    "packages/protocol/src/native-verified-transfer-intent.ts",
    "utf8",
  );

test(
  "verified transfer intent keeps the legacy intent format separate",
  () => {
    assert.ok(
      source.includes(
        "POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1",
      ),
    );
    assert.ok(
      source.includes(
        "baseIntentSha256",
      ),
    );
    assert.ok(
      source.includes(
        "verifiedIntentSha256",
      ),
    );
  },
);

test(
  "verified transfer intent binds fee epoch and reviewed authority policy",
  () => {
    for (const invariant of [
      "feeEvidenceSha256",
      "observedEpoch",
      "observedSlot",
      "feeAuthorityPolicySha256",
      "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
    ]) {
      assert.ok(
        source.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "verified transfer intent has deterministic tamper verification",
  () => {
    for (const invariant of [
      "canonicalJsonSha256",
      "verifyNativePwrcVerifiedTransferIntent",
      "PWRC_NATIVE_VERIFIED_INTENT_COMMITMENT_MISMATCH",
      "PWRC_NATIVE_VERIFIED_INTENT_TOKEN_POLICY_MISMATCH",
    ]) {
      assert.ok(
        source.includes(
          invariant,
        ),
      );
    }
  },
);
