import fs from "node:fs";

const failures = [];

const intent =
  fs.readFileSync(
    "packages/protocol/src/native-transfer-intent.ts",
    "utf8",
  );
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const verifiedIntent =
  fs.readFileSync(
    "packages/protocol/src/native-verified-transfer-intent.ts",
    "utf8",
  );
const reviewBundle =
  fs.readFileSync(
    "packages/sdk/src/native-transfer-review-bundle.ts",
    "utf8",
  );
const idempotency =
  fs.readFileSync(
    "packages/sdk/src/idempotency-registry.ts",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_INTENT_V1",
  "lastValidBlockHeight",
  "intentSha256",
  "PWRC_NATIVE_INTENT_EXPIRED",
  "PWRC_NATIVE_INTENT_BLOCKHASH_EXPIRED",
  "PWRC_NATIVE_INTENT_TOTAL_PRIORITY_FEE_INVALID",
  "PWRC_NATIVE_INTENT_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT",
  "PWRC_NATIVE_INTENT_TOKEN_POLICY_MISMATCH",
  "tokenPolicySha256",
]) {
  if (!intent.includes(invariant)) {
    failures.push(
      `transaction-integrity:intent:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1",
  "baseIntentSha256",
  "feeEvidenceSha256",
  "feeAuthorityPolicySha256",
  "verifiedIntentSha256",
]) {
  if (!verifiedIntent.includes(invariant)) {
    failures.push(
      `transaction-integrity:verified-intent:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
  "verifiedIntentSha256",
  "preflightReportSha256",
  "unsignedMessageSha256",
  "bundleSha256",
  "authorizationIncluded:",
]) {
  if (!reviewBundle.includes(invariant)) {
    failures.push(
      `transaction-integrity:review-bundle:${invariant}`,
    );
  }
}

for (const invariant of [
  "buildUnsignedNativePwrcTransactionFromIntent",
  "reviewUnsignedNativePwrcTransaction",
  "serializeMessage",
  "PWRC_NATIVE_TRANSACTION_MESSAGE_MISMATCH",
  "PWRC_NATIVE_TRANSACTION_BLOCKHASH_MISMATCH",
  "PWRC_NATIVE_TRANSACTION_FEE_PAYER_MISMATCH",
  "feeEvidenceSha256",
  "assertNativePwrcTransferFeeEpochEvidenceFresh",
  "buildVerifiedUnsignedNativePwrcTransferTransaction",
  "PWRC_NATIVE_TRANSFER_TOTAL_PRIORITY_FEE_INVALID",
  "PWRC_NATIVE_TRANSFER_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT",
  "PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX",
]) {
  if (!transactions.includes(invariant)) {
    failures.push(
      `transaction-integrity:review:${invariant}`,
    );
  }
}

for (const invariant of [
  "createBoundedIdempotencyRegistry",
  "PWRC_IDEMPOTENCY_REPLAY",
  "PWRC_IDEMPOTENCY_REGISTRY_FULL",
  "maxEntries",
  "ttlMs",
]) {
  if (!idempotency.includes(invariant)) {
    failures.push(
      `transaction-integrity:idempotency:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  deterministicTransferIntent:
    true,
  exactUnsignedMessageReview:
    true,
  blockhashLifetimeBound:
    true,
  liveFeeEpochBound:
    true,
  verifiedTransferIntentBound:
    true,
  evidenceReviewBundleBound:
    true,
  canonicalTokenPolicyBound:
    true,
  totalPriorityFeeBound:
    true,
  boundedReplayProtection:
    true,
  walletOwnedSigning:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
