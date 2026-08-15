import fs from "node:fs";
import {
  tokenFeeAuthorityPolicySha256,
  verifyTokenFeeAuthorityPolicyDocument,
  TOKEN_FEE_AUTHORITY_POLICY_PATH,
} from "./token-fee-authority-policy.mjs";

const inputPath =
  process.argv[2] ??
  "config/mainnet/token-fee-authorities.draft.json";

if (
  !fs.existsSync(
    inputPath,
  )
) {
  console.error(
    `missing draft authority policy: ${inputPath}`,
  );
  process.exit(2);
}

let draft;

try {
  draft =
    JSON.parse(
      fs.readFileSync(
        inputPath,
        "utf8",
      ),
    );
} catch {
  console.error(
    "invalid draft authority policy JSON",
  );
  process.exit(2);
}

const policy = {
  version:
    draft.version,
  cluster:
    draft.cluster,
  mint:
    draft.mint,
  configured:
    draft.configured,
  transferFeeConfigAuthority:
    draft.transferFeeConfigAuthority,
  withdrawWithheldAuthority:
    draft.withdrawWithheldAuthority,
  reviewedAt:
    draft.reviewedAt,
  reviewReference:
    draft.reviewReference,
};

const document = {
  ...policy,
  policySha256:
    tokenFeeAuthorityPolicySha256(
      policy,
    ),
};

const verification =
  verifyTokenFeeAuthorityPolicyDocument(
    document,
    {
      requireConfigured:
        true,
    },
  );

if (
  !verification.ok
) {
  console.error(
    `invalid reviewed authority policy: ${verification.failures.join(",")}`,
  );
  process.exit(2);
}

fs.writeFileSync(
  TOKEN_FEE_AUTHORITY_POLICY_PATH,
  `${JSON.stringify(document, null, 2)}\n`,
  {
    flag:
      "wx",
  },
);

console.log(JSON.stringify({
  ok:
    true,
  version:
    "1.0.0",
  output:
    TOKEN_FEE_AUTHORITY_POLICY_PATH,
  policySha256:
    document.policySha256,
  configured:
    true,
}, null, 2));
