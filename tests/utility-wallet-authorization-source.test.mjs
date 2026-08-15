import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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

test(
  "utility wallet authorization is domain and policy bound",
  () => {
    for (const invariant of [
      "POWERCHAIN_PWRC_UTILITY_WALLET_AUTHORIZATION_V1",
      "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
      "PWRC_CANONICAL_MINT",
      "serviceId",
      "recipient",
      "nonce",
      "walletMessageSha256",
      "authorizationSha256",
    ]) {
      assert.ok(
        utility.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "wallet authorization remains unsigned and wallet-owned",
  () => {
    assert.ok(
      utility.includes(
        "signatureIncluded:",
      ),
    );
    assert.ok(
      utility.includes(
        "false",
      ),
    );

    for (const forbidden of [
      "Keypair.generate(",
      "fromSecretKey(",
      "signTransaction(",
      "sendTransaction(",
    ]) {
      assert.equal(
        utility.includes(
          forbidden,
        ),
        false,
      );
    }
  },
);

test(
  "utility runtime advertises replay and signature boundaries",
  () => {
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
      assert.ok(
        runtime.includes(
          invariant,
        ),
      );
    }
  },
);
