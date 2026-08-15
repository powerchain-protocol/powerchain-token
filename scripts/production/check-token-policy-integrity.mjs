import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

function canonicalJson(
  value,
) {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return JSON.stringify(
      value,
    );
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(canonicalJson)
      .join(",")}]`;
  }

  return `{${Object
    .keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(value[key])}`,
    )
    .join(",")}}`;
}

const token =
  JSON.parse(
    fs.readFileSync(
      "config/token.json",
      "utf8",
    ),
  );
const assets =
  JSON.parse(
    fs.readFileSync(
      "config/assets.json",
      "utf8",
    ),
  );
const fees =
  JSON.parse(
    fs.readFileSync(
      "config/fees.json",
      "utf8",
    ),
  );
const policyDocument =
  JSON.parse(
    fs.readFileSync(
      "config/token-policy.json",
      "utf8",
    ),
  );
const metadata =
  JSON.parse(
    fs.readFileSync(
      "metadata/metadata.json",
      "utf8",
    ),
  );
const wpwrcMetadata =
  JSON.parse(
    fs.readFileSync(
      "metadata/wpwrc.json",
      "utf8",
    ),
  );
const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );
const tokenPolicySource =
  fs.readFileSync(
    "packages/protocol/src/token-policy.ts",
    "utf8",
  );
const tokenAmountSource =
  fs.readFileSync(
    "packages/protocol/src/token-amount.ts",
    "utf8",
  );
const nativeTokenSource =
  fs.readFileSync(
    "packages/protocol/src/native-token.ts",
    "utf8",
  );
const verifier =
  fs.readFileSync(
    "programs/token/src/lib.rs",
    "utf8",
  );
const wrapped =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );

const {
  policySha256,
  ...policy
} =
  policyDocument;

const calculatedPolicySha256 =
  crypto
    .createHash(
      "sha256",
    )
    .update(
      canonicalJson({
        domain:
          "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
        policy,
      }),
    )
    .digest(
      "hex",
    );

if (
  policySha256 !==
    calculatedPolicySha256 ||
  policySha256 !==
    "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4"
) {
  failures.push(
    "token-policy:commitment",
  );
}

for (const [label, actual, expected] of [
  [
    "token.version",
    token.version,
    "1.0.0",
  ],
  [
    "token.mint",
    token.mint,
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  ],
  [
    "token.standard",
    token.standard,
    "Token-2022",
  ],
  [
    "token.supply",
    token.supply?.baseUnits,
    "18446000000000000000",
  ],
  [
    "token.u64-headroom",
    token.supply?.u64HeadroomBaseUnits,
    "744073709551615",
  ],
  [
    "token.fee-bps",
    String(
      token.transferFee?.basisPoints,
    ),
    "250",
  ],
  [
    "token.fee-cap",
    token.transferFee?.maximumFeeBaseUnits,
    "1000000000000000",
  ],
  [
    "token.fee-cap-start",
    token.transferFee?.feeCapStartsAtGrossBaseUnits,
    "40000000000000000",
  ],
  [
    "assets.pwrc-supply",
    assets.assets?.PWRC?.supplyBaseUnits,
    "18446000000000000000",
  ],
  [
    "assets.wpwrc-max",
    assets.assets?.wPWRC?.maxWrappedSupplyBaseUnits,
    "18446000000000000000",
  ],
  [
    "fees.supply",
    fees.accounting?.canonicalSupplyBaseUnits,
    "18446000000000000000",
  ],
  [
    "metadata.pwrc-mint",
    metadata.properties?.mint,
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  ],
  [
    "metadata.wpwrc-canonical-mint",
    wpwrcMetadata.properties?.canonical_mint,
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  ],
]) {
  if (actual !== expected) {
    failures.push(
      `token-policy:${label}:expected=${expected}:actual=${String(actual)}`,
    );
  }
}

if (
  JSON.stringify(
    token.extensions,
  ) !==
    JSON.stringify([
      "TransferFeeConfig",
      "MetadataPointer",
      "TokenMetadata",
    ]) ||
  JSON.stringify(
    policy.native.extensions,
  ) !==
    JSON.stringify(
      token.extensions,
    )
) {
  failures.push(
    "token-policy:extension-profile",
  );
}

if (
  token.authorities?.mintAuthorityAfterGenesis !==
    null ||
  token.authorities?.freezeAuthority !==
    null ||
  token.authorities?.transferFeeAuthorities !==
    "release-evidence-required"
) {
  failures.push(
    "token-policy:authority-policy",
  );
}

if (
  token.tokenPolicy?.sha256 !==
    policySha256 ||
  assets.tokenPolicy?.sha256 !==
    policySha256
) {
  failures.push(
    "token-policy:config-sha-parity",
  );
}

for (const invariant of [
  "PWRC_U64_HEADROOM_BASE_UNITS",
  "PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS",
]) {
  if (!constants.includes(invariant)) {
    failures.push(
      `token-policy:constants:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
  "PWRC_TOKEN_POLICY_SHA256",
  "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  "PWRC_TOKEN_POLICY_COMMITMENT_MISMATCH",
]) {
  if (!tokenPolicySource.includes(invariant)) {
    failures.push(
      `token-policy:source:${invariant}`,
    );
  }
}

for (const invariant of [
  "parsePwrcTokensToBaseUnits",
  "formatPwrcBaseUnits",
  "assertCanonicalPwrcBaseUnitsString",
  "PWRC_AMOUNT_PRECISION_EXCEEDED",
  "PWRC_AMOUNT_EXCEEDS_SUPPLY",
]) {
  if (!tokenAmountSource.includes(invariant)) {
    failures.push(
      `token-policy:amount:${invariant}`,
    );
  }
}

for (const invariant of [
  "feeAtMaximum",
  "feeCapped",
  "feeCapStartsAtGrossBaseUnits",
  "PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS",
]) {
  if (!nativeTokenSource.includes(invariant)) {
    failures.push(
      `token-policy:preview:${invariant}`,
    );
  }
}

for (const invariant of [
  "18_446_000_000_000_000_000",
  "PWRC_TRANSFER_FEE_BPS",
  "PWRC_MAX_TRANSFER_FEE_BASE_UNITS",
]) {
  if (!verifier.includes(invariant)) {
    failures.push(
      `token-policy:solana-verifier:${invariant}`,
    );
  }
}

for (const invariant of [
  "WPWRC_MAX_BASE_UNITS: u64 = 18_446_000_000_000_000_000",
  "wrapped_supply_base_units: 0",
]) {
  if (!wrapped.includes(invariant)) {
    failures.push(
      `token-policy:wrapped:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  policyDomain:
    "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  policySha256,
  fixedSupplyBaseUnits:
    "18446000000000000000",
  u64HeadroomBaseUnits:
    "744073709551615",
  transferFeeBasisPoints:
    250,
  maximumTransferFeeBaseUnits:
    "1000000000000000",
  feeCapStartsAtGrossBaseUnits:
    "40000000000000000",
  wrappedGenesisSupplyBaseUnits:
    "0",
  canonicalBaseUnitsPerWrappedBaseUnit:
    "1",
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
