import fs from "node:fs";

const failures = [];

const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );
const native =
  fs.readFileSync(
    "packages/protocol/src/native-token.ts",
    "utf8",
  );
const verifier =
  fs.readFileSync(
    "programs/token/src/lib.rs",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/solana-client.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/native-token.mjs",
    "utf8",
  );
const canonicalApi =
  fs.readFileSync(
    "apps/api/lib/token-policy.mjs",
    "utf8",
  );
const canonicalPolicyDocument =
  JSON.parse(
    fs.readFileSync(
      "config/token-policy.json",
      "utf8",
    ),
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  'PWRC_GENESIS_SUPPLY = 18_446_000_000n',
  'PWRC_DECIMALS = 9',
  'PWRC_TRANSFER_FEE_BPS = 250n',
  'PWRC_MAX_TRANSFER_FEE_BASE_UNITS =',
  'PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS =',
  '40_000_000_000_000_000n',
]) {
  if (!constants.includes(invariant)) {
    failures.push(
      `native-token:constants:${invariant}`,
    );
  }
}

for (const invariant of [
  "TransferFeeConfig",
  "MetadataPointer",
  "TokenMetadata",
  "PermanentDelegate",
  "MintCloseAuthority",
  "verifyNativePwrcMintObservation",
  "nativePwrcTransferPreview",
  "PWRC_NATIVE_TOKEN_PROGRAM_MISMATCH",
  "PWRC_NATIVE_METADATA_POINTER_MISMATCH",
  "feeCapStartsAtGrossBaseUnits",
  "feeCapped",
  "feeAtMaximum",
]) {
  if (!native.includes(invariant)) {
    failures.push(
      `native-token:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_CANONICAL_MINT",
  "PWRC_GENESIS_BASE_UNITS",
  "MintAuthorityPresent",
  "FreezeAuthorityPresent",
  "owner =",
  "anchor_spl::token_2022::ID",
]) {
  if (!verifier.includes(invariant)) {
    failures.push(
      `native-token:verifier:${invariant}`,
    );
  }
}

for (const forbidden of [
  "pub fn mint",
  "mint_to",
  "set_authority",
]) {
  if (verifier.includes(forbidden)) {
    failures.push(
      `native-token:verifier-forbidden:${forbidden}`,
    );
  }
}

for (const invariant of [
  "verifyNativePwrcMintObservation",
  "nativePwrcTransferPreview",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `native-token:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  "canonicalNativeTokenPolicy",
  "nativePwrcPolicyPayload",
  "nativePwrcPolicySha256",
  "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `native-token:api-adapter:${invariant}`,
    );
  }
}

for (const invariant of [
  "config/token-policy.json",
  "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  "canonicalNativeTokenPolicy",
  '"2.5"',
  '"1000000"',
  '"40000000"',
  "verificationOnly:",
  "true",
  "publicWrites:",
  "false",
]) {
  if (!canonicalApi.includes(invariant)) {
    failures.push(
      `native-token:canonical-api:${invariant}`,
    );
  }
}

if (
  canonicalPolicyDocument.native?.standard !==
    "Token-2022" ||
  canonicalPolicyDocument.native?.fixedSupplyTokens !==
    "18446000000" ||
  canonicalPolicyDocument.native?.fixedSupplyBaseUnits !==
    "18446000000000000000" ||
  JSON.stringify(
    canonicalPolicyDocument.native?.extensions,
  ) !==
    JSON.stringify([
      "TransferFeeConfig",
      "MetadataPointer",
      "TokenMetadata",
    ])
) {
  failures.push(
    "native-token:canonical-policy-document",
  );
}

if (
  !server.includes(
    "/api/v1/token/native-policy",
  )
) {
  failures.push(
    "native-token:route-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  standard:
    "Token-2022",
  fixedSupply:
    "18446000000",
  decimals:
    9,
  transferFeeBps:
    250,
  transferFeeCapPwrc:
    "1000000",
  requiredExtensions: [
    "TransferFeeConfig",
    "MetadataPointer",
    "TokenMetadata",
  ],
  mintAuthority:
    null,
  freezeAuthority:
    null,
  verifierMutationCapability:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
