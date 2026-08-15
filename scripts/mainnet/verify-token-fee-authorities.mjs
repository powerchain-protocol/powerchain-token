import {
  loadTokenFeeAuthorityPolicy,
  TOKEN_FEE_AUTHORITY_POLICY_DOMAIN,
  TOKEN_FEE_AUTHORITY_POLICY_PATH,
} from "./token-fee-authority-policy.mjs";

const result =
  loadTokenFeeAuthorityPolicy(
    TOKEN_FEE_AUTHORITY_POLICY_PATH,
    {
      requireConfigured:
        true,
    },
  );

console.log(JSON.stringify({
  ok:
    result.ok,
  version:
    "1.0.0",
  domain:
    TOKEN_FEE_AUTHORITY_POLICY_DOMAIN,
  path:
    TOKEN_FEE_AUTHORITY_POLICY_PATH,
  configured:
    result.policy?.configured ===
      true,
  policySha256:
    result.policySha256,
  transferFeeConfigAuthority:
    result.ok
      ? result.policy
          .transferFeeConfigAuthority
      : undefined,
  withdrawWithheldAuthority:
    result.ok
      ? result.policy
          .withdrawWithheldAuthority
      : undefined,
  reviewReference:
    result.ok
      ? result.policy
          .reviewReference
      : undefined,
  failures:
    result.failures,
}, null, 2));

if (!result.ok) {
  process.exit(1);
}
