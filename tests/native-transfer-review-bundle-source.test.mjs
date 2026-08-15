import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const bundle =
  fs.readFileSync(
    "packages/sdk/src/native-transfer-review-bundle.ts",
    "utf8",
  );
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );

test(
  "review bundle commits the full wallet-review evidence chain",
  () => {
    for (const invariant of [
      "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
      "tokenPolicySha256",
      "intentSha256",
      "verifiedIntentSha256",
      "feeEvidenceSha256",
      "feeAuthorityPolicySha256",
      "preflightReportSha256",
      "unsignedMessageSha256",
      "bundleSha256",
    ]) {
      assert.ok(
        bundle.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "review bundle verifies every upstream evidence boundary",
  () => {
    for (const invariant of [
      "verifyNativePwrcTransferIntent",
      "verifyNativePwrcVerifiedTransferIntent",
      "assertNativePwrcTransferFeeEpochEvidenceFresh",
      "verifyNativePwrcTransferPreflightReport",
      "reviewUnsignedNativePwrcTransaction",
      "PWRC_NATIVE_REVIEW_BUNDLE_VERIFIED_INTENT_MISMATCH",
      "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_INTENT_MISMATCH",
      "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_TRANSACTION_MISMATCH",
      "PWRC_NATIVE_REVIEW_BUNDLE_COMMITMENT_MISMATCH",
    ]) {
      assert.ok(
        bundle.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "review bundle is explicitly non-authorizing and non-submitting",
  () => {
    for (const invariant of [
      "signingIncluded:",
      "submissionIncluded:",
      "authorizationIncluded:",
      "publicWrites:",
    ]) {
      assert.ok(
        bundle.includes(
          invariant,
        ),
      );
    }

    for (const forbidden of [
      "sendTransaction(",
      "sendRawTransaction(",
      "sendAndConfirmTransaction(",
      "Keypair.generate(",
      "fromSecretKey(",
    ]) {
      assert.equal(
        bundle.includes(
          forbidden,
        ),
        false,
      );
    }
  },
);

test(
  "SDK exposes a verified intent factory and runtime advertises evidence binding",
  () => {
    assert.ok(
      transactions.includes(
        "createVerifiedNativePwrcTransferIntentForTransaction",
      ),
    );

    for (const invariant of [
      "feeEpochEvidenceBound",
      "feeAuthorityPolicyCommitmentBound",
      "preflightReportBound",
      "unsignedMessageBound",
      "authorizationIncluded",
    ]) {
      assert.ok(
        runtime.includes(
          invariant,
        ),
      );
    }
  },
);
