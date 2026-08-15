import fs from "node:fs";
import {
  verifyTokenFeeAuthorityPolicyDocument,
} from "../mainnet/token-fee-authority-policy.mjs";

const failures = [];

const example =
  JSON.parse(
    fs.readFileSync(
      "config/mainnet/token-fee-authorities.example.json",
      "utf8",
    ),
  );
const exampleResult =
  verifyTokenFeeAuthorityPolicyDocument(
    example,
    {
      requireConfigured:
        false,
    },
  );
const releaseExampleResult =
  verifyTokenFeeAuthorityPolicyDocument(
    example,
    {
      requireConfigured:
        true,
    },
  );

if (
  !exampleResult.ok ||
  releaseExampleResult.ok ||
  !releaseExampleResult.failures.includes(
    "token-fee-authority-policy:not-configured",
  )
) {
  failures.push(
    "token-fee-authority-policy:example-fail-closed",
  );
}

for (const [file, invariants] of [
  [
    "scripts/mainnet/status.mjs",
    [
      "feeAuthorityPolicyReady",
      "verify-token-fee-authorities.mjs",
      "config/mainnet/token-fee-authorities.json:not-verified",
    ],
  ],
  [
    "scripts/mainnet/capture-native-token-attestation.mjs",
    [
      "reviewedAuthorityPolicy",
      "transferFeeAuthorityPolicySha256",
    ],
  ],
  [
    "scripts/mainnet/verify-native-token-attestation.mjs",
    [
      "reviewedAuthorityPolicy",
      "transferFeeAuthorityPolicySha256",
      "reviewed-policy-mismatch",
    ],
  ],
  [
    "scripts/mainnet/seal-token-fee-authorities.mjs",
    [
      "tokenFeeAuthorityPolicySha256",
      'flag:\n      "wx"',
    ],
  ],
]) {
  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (const invariant of invariants) {
    if (
      !source.includes(
        invariant.replace(
          "\\n",
          "\n",
        ),
      )
    ) {
      failures.push(
        `token-fee-authority-policy:${file}:${invariant}`,
      );
    }
  }
}

if (
  fs.existsSync(
    "config/mainnet/token-fee-authorities.json",
  )
) {
  failures.push(
    "token-fee-authority-policy:real-artifact-must-not-be-shipped-unreviewed",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  domain:
    "POWERCHAIN_MAINNET_TRANSFER_FEE_AUTHORITY_POLICY_V1",
  reviewedArtifactRequired:
    true,
  envOnlyReleaseGating:
    false,
  attestationCommitmentBound:
    true,
  safeExampleConfigured:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
