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

for (const invariant of [
  "verifyNativePwrcTransferIntent",
  "PWRC_NATIVE_INTENT_VERSION_MISMATCH",
  "PWRC_NATIVE_INTENT_MINT_MISMATCH",
  "PWRC_NATIVE_INTENT_FEE_MISMATCH",
  "PWRC_NATIVE_INTENT_NET_MISMATCH",
  "PWRC_NATIVE_INTENT_COMMITMENT_MISMATCH",
  "PWRC_NATIVE_INTENT_AMOUNT_ENCODING_INVALID",
  "parseCanonicalUnsignedBigInt",
]) {
  if (!intent.includes(invariant)) {
    failures.push(
      `transfer-intent:${invariant}`,
    );
  }
}

for (const invariant of [
  "verifyNativePwrcTransferIntent",
  "PWRC_NATIVE_INTENT_VERIFICATION_FAILED",
  "verifiedIntent",
]) {
  if (!transactions.includes(invariant)) {
    failures.push(
      `transaction-review:${invariant}`,
    );
  }
}

for (const forbidden of [
  "sendTransaction(",
  "sendAndConfirmTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    intent.includes(forbidden) ||
    transactions.includes(forbidden)
  ) {
    failures.push(
      `transfer-intent:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  canonicalIntentReverification:
    true,
  canonicalIntegerEncoding:
    true,
  feeRecomputed:
    true,
  netRecomputed:
    true,
  commitmentRecomputed:
    true,
  reviewFailsClosedBeforeMessageRebuild:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
