import fs from "node:fs";
import {
  loadTokenFeeAuthorityPolicy,
} from "./token-fee-authority-policy.mjs";

const inputPath =
  process.argv[2] ??
  "reports/live-native-token-attestation.json";
const outputPath =
  "config/mainnet/native-token-attestation.json";

if (
  !fs.existsSync(
    inputPath,
  )
) {
  console.error(
    `missing live attestation input: ${inputPath}`,
  );
  process.exit(2);
}

if (
  !fs.existsSync(
    "reports/source-tree.sha256",
  )
) {
  console.error(
    "missing reports/source-tree.sha256",
  );
  process.exit(2);
}

const live =
  JSON.parse(
    fs.readFileSync(
      inputPath,
      "utf8",
    ),
  );

if (
  live.version !==
    "1.0.0" ||
  live.cluster !==
    "mainnet-beta" ||
  live.verified !==
    true ||
  live.publicWrites !==
    false
) {
  console.error(
    "invalid live native-token attestation input",
  );
  process.exit(2);
}

const sourceTreeSha256 =
  fs.readFileSync(
    "reports/source-tree.sha256",
    "utf8",
  )
  .trim()
  .toLowerCase();

const reviewedAuthorityPolicy =
  loadTokenFeeAuthorityPolicy(
    "config/mainnet/token-fee-authorities.json",
    {
      requireConfigured:
        true,
    },
  );

if (
  !reviewedAuthorityPolicy.ok
) {
  console.error(
    `invalid reviewed token fee authority policy: ${reviewedAuthorityPolicy.failures.join(",")}`,
  );
  process.exit(2);
}

const liveFeePolicy =
  live.transferFeeAuthorityPolicy ??
  {};

if (
  liveFeePolicy.transferFeeConfigAuthority !==
    reviewedAuthorityPolicy.policy
      .transferFeeConfigAuthority ||
  liveFeePolicy.withdrawWithheldAuthority !==
    reviewedAuthorityPolicy.policy
      .withdrawWithheldAuthority
) {
  console.error(
    "live native-token attestation fee authorities do not match reviewed policy",
  );
  process.exit(2);
}

const evidence = {
  ...live,
  version:
    "1.0.0",
  capturedAt:
    new Date()
      .toISOString(),
  sourceTreeSha256,
  transferFeeAuthorityPolicySha256:
    reviewedAuthorityPolicy
      .policySha256,
};

fs.mkdirSync(
  "config/mainnet",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  outputPath,
  `${JSON.stringify(evidence, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      ok:
        true,
      version:
        "1.0.0",
      output:
        outputPath,
      sourceTreeSha256,
      consensusSha256:
        evidence.consensusSha256,
      attestationSha256:
        evidence.attestationSha256,
      transferFeeAuthorityPolicySha256:
        evidence.transferFeeAuthorityPolicySha256,
    },
    null,
    2,
  ),
);
