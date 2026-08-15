import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  verifyTokenFeeAuthorityPolicyDocument,
} from "../scripts/mainnet/token-fee-authority-policy.mjs";

const example =
  JSON.parse(
    fs.readFileSync(
      "config/mainnet/token-fee-authorities.example.json",
      "utf8",
    ),
  );
const status =
  fs.readFileSync(
    "scripts/mainnet/status.mjs",
    "utf8",
  );
const capture =
  fs.readFileSync(
    "scripts/mainnet/capture-native-token-attestation.mjs",
    "utf8",
  );
const verifier =
  fs.readFileSync(
    "scripts/mainnet/verify-native-token-attestation.mjs",
    "utf8",
  );

test(
  "safe example policy has a valid deterministic commitment but is not configured",
  () => {
    const result =
      verifyTokenFeeAuthorityPolicyDocument(
        example,
        {
          requireConfigured:
            false,
        },
      );

    assert.equal(
      result.ok,
      true,
    );
    assert.equal(
      result.policy?.configured,
      false,
    );

    const release =
      verifyTokenFeeAuthorityPolicyDocument(
        example,
        {
          requireConfigured:
            true,
        },
      );

    assert.equal(
      release.ok,
      false,
    );
    assert.ok(
      release.failures.includes(
        "token-fee-authority-policy:not-configured",
      ),
    );
  },
);

test(
  "mainnet release status requires the reviewed authority artifact",
  () => {
    assert.ok(
      status.includes(
        "verify-token-fee-authorities.mjs",
      ),
    );
    assert.ok(
      status.includes(
        "feeAuthorityPolicyReady",
      ),
    );
    assert.ok(
      status.includes(
        "config/mainnet/token-fee-authorities.json:not-verified",
      ),
    );
  },
);

test(
  "native attestation capture and verification bind the reviewed policy commitment",
  () => {
    assert.ok(
      capture.includes(
        "transferFeeAuthorityPolicySha256",
      ),
    );
    assert.ok(
      verifier.includes(
        "transferFeeAuthorityPolicySha256",
      ),
    );
    assert.ok(
      verifier.includes(
        "reviewedAuthorityPolicy.policySha256",
      ),
    );
  },
);
