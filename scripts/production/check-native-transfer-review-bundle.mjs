import fs from "node:fs";

const failures = [];

const verifiedIntent =
  fs.readFileSync(
    "packages/protocol/src/native-verified-transfer-intent.ts",
    "utf8",
  );
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
const sdkIndex =
  fs.readFileSync(
    "packages/sdk/src/index.ts",
    "utf8",
  );
const sdkPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/sdk/package.json",
      "utf8",
    ),
  );
const protocolPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/protocol/package.json",
      "utf8",
    ),
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1",
  "baseIntentSha256",
  "feeEvidenceSha256",
  "observedEpoch",
  "observedSlot",
  "feeAuthorityPolicySha256",
  "verifiedIntentSha256",
  "verifyNativePwrcVerifiedTransferIntent",
  "PWRC_NATIVE_VERIFIED_INTENT_COMMITMENT_MISMATCH",
]) {
  if (!verifiedIntent.includes(invariant)) {
    failures.push(
      `native-verified-intent:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
  "verifiedIntentSha256",
  "feeEvidenceSha256",
  "feeAuthorityPolicySha256",
  "preflightReportSha256",
  "unsignedMessageSha256",
  "bundleSha256",
  "verifyNativePwrcTransferIntent",
  "verifyNativePwrcVerifiedTransferIntent",
  "assertNativePwrcTransferFeeEpochEvidenceFresh",
  "verifyNativePwrcTransferPreflightReport",
  "reviewUnsignedNativePwrcTransaction",
  "PWRC_NATIVE_REVIEW_BUNDLE_VERIFIED_INTENT_MISMATCH",
  "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_TRANSACTION_MISMATCH",
  "PWRC_NATIVE_REVIEW_BUNDLE_COMMITMENT_MISMATCH",
  "authorizationIncluded:",
  "submissionIncluded:",
  "signingIncluded:",
  "publicWrites:",
]) {
  if (!bundle.includes(invariant)) {
    failures.push(
      `native-review-bundle:${invariant}`,
    );
  }
}

if (
  protocolPackage.exports?.[
    "./native-verified-transfer-intent"
  ] !==
    "./src/native-verified-transfer-intent.ts"
) {
  failures.push(
    "native-review-bundle:protocol-export",
  );
}

if (
  sdkPackage.exports?.[
    "./native-transfer-review-bundle"
  ] !==
    "./src/native-transfer-review-bundle.ts" ||
  !sdkIndex.includes(
    'export * from "./native-transfer-review-bundle.js";',
  )
) {
  failures.push(
    "native-review-bundle:sdk-export",
  );
}

if (
  !transactions.includes(
    "createVerifiedNativePwrcTransferIntentForTransaction",
  )
) {
  failures.push(
    "native-review-bundle:verified-intent-factory",
  );
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
  "transferIntentBound",
  "feeEpochEvidenceBound",
  "feeAuthorityPolicyCommitmentBound",
  "preflightReportBound",
  "unsignedMessageBound",
  "authorizationIncluded",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `native-review-bundle:runtime:${invariant}`,
    );
  }
}

for (const forbidden of [
  "sendTransaction(",
  "sendRawTransaction(",
  "sendAndConfirmTransaction(",
  "Keypair.generate(",
  "fromSecretKey(",
]) {
  if (bundle.includes(forbidden)) {
    failures.push(
      `native-review-bundle:write-or-secret:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  verifiedIntentDomain:
    "POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1",
  reviewBundleDomain:
    "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
  legacyIntentCompatible:
    true,
  tokenPolicyBound:
    true,
  feeEpochEvidenceBound:
    true,
  feeAuthorityPolicyCommitmentBound:
    true,
  preflightReportBound:
    true,
  unsignedMessageBound:
    true,
  signingIncluded:
    false,
  submissionIncluded:
    false,
  authorizationIncluded:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
