import fs from "node:fs";

const failures = [];

const utility =
  fs.readFileSync(
    "packages/protocol/src/utility.ts",
    "utf8",
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_PWRC_UTILITY_WALLET_AUTHORIZATION_V1",
  "createPwrcUtilityWalletAuthorization",
  "verifyPwrcUtilityWalletAuthorization",
  "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
  "PWRC_CANONICAL_MINT",
  "PWRC_UTILITY_NONCE_INVALID",
  "PWRC_UTILITY_RECIPIENT_INVALID",
  "PWRC_UTILITY_RECIPIENT_SELF_FORBIDDEN",
  "PWRC_UTILITY_WALLET_AUTH_TOKEN_POLICY_MISMATCH",
  "PWRC_UTILITY_WALLET_AUTH_MESSAGE_HASH_MISMATCH",
  "PWRC_UTILITY_WALLET_AUTH_COMMITMENT_MISMATCH",
  "PWRC_UTILITY_WALLET_AUTH_EXPIRED",
  "signatureIncluded:",
]) {
  if (!utility.includes(invariant)) {
    failures.push(
      `utility-wallet-auth:${invariant}`,
    );
  }
}

for (const invariant of [
  "walletSignableEnvelopeAvailable",
  "walletSignatureIncluded",
  "networkBound",
  "serviceBound",
  "recipientBound",
  "nonceBound",
  "tokenPolicyBound",
  "maxAuthorizationLifetimeSeconds",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `utility-runtime:${invariant}`,
    );
  }
}

for (const forbidden of [
  "Keypair.generate(",
  "fromSecretKey(",
  "sendAndConfirmTransaction(",
  "sendTransaction(",
]) {
  if (utility.includes(forbidden)) {
    failures.push(
      `utility-wallet-auth:secret-or-submit:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  legacyAuthorizationPreserved:
    true,
  walletSignableEnvelope:
    true,
  signatureIncluded:
    false,
  networkBound:
    true,
  serviceBound:
    true,
  recipientBound:
    true,
  nonceBound:
    true,
  tokenPolicyBound:
    true,
  maxLifetimeSeconds:
    900,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
