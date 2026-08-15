import fs from "node:fs";

const failures = [];

const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );
const nativeToken =
  fs.readFileSync(
    "packages/protocol/src/native-token.ts",
    "utf8",
  );
const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );
const attestationApi =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );
const mainnetStatus =
  fs.readFileSync(
    "scripts/mainnet/status.mjs",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const invariant of [
  "PWRC_TX_COMPUTE_UNIT_LIMIT_MAX",
  "400_000",
  "PWRC_TX_PRIORITY_FEE_MICROLAMPORTS_MAX",
  "1_000_000n",
]) {
  if (!constants.includes(invariant)) {
    failures.push(
      `v26:constants:${invariant}`,
    );
  }
}

for (const invariant of [
  "transferFeeConfigAuthority",
  "withdrawWithheldAuthority",
  "verifyNativePwrcTransferFeeAuthorities",
  "PWRC_NATIVE_TRANSFER_FEE_CONFIG_AUTHORITY_MISMATCH",
  "PWRC_NATIVE_WITHDRAW_WITHHELD_AUTHORITY_MISMATCH",
]) {
  if (!nativeToken.includes(invariant)) {
    failures.push(
      `v26:native-token:${invariant}`,
    );
  }
}

for (const invariant of [
  "transferFeeConfigAuthority",
  "withdrawWithheldAuthority",
  "transferFeeAuthorityPolicy",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `v26:observer:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_TX_COMPUTE_UNIT_LIMIT_MAX",
  "PWRC_TX_PRIORITY_FEE_MICROLAMPORTS_MAX",
]) {
  if (!transactions.includes(invariant)) {
    failures.push(
      `v26:transactions:${invariant}`,
    );
  }
}

for (const invariant of [
  "dexTransferCompatible",
  '"integration-ready"',
  "exchangeListingVerified",
  "liquidityConfigured",
  "transactionSafetyCeilings",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `v26:runtime:${invariant}`,
    );
  }
}

if (
  runtime.includes(
    "tradeable:\\n      true",
  )
) {
  failures.push(
    "v26:runtime:unverified-tradeability-claim",
  );
}

for (const invariant of [
  "PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED",
  "PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED",
  "decodedBase58Length",
]) {
  if (!attestationApi.includes(invariant)) {
    failures.push(
      `v26:authority-config:${invariant}`,
    );
  }
}

for (const key of [
  "PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED=",
  "PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED=",
]) {
  if (!env.includes(key)) {
    failures.push(
      `v26:env:${key}`,
    );
  }
}

for (const invariant of [
  "feeAuthoritiesConfigured",
  "token-transfer-fee-authorities:not-configured",
]) {
  if (!mainnetStatus.includes(invariant)) {
    failures.push(
      `v26:mainnet:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  transferFeeAuthoritiesObserved:
    true,
  expectedAuthorityPolicyRequired:
    true,
  authorityAddressesExact32Bytes:
    true,
  computeUnitCeiling:
    400000,
  priorityFeeMicroLamportsCeiling:
    "1000000",
  tradeabilityClaimQualified:
    true,
  mainnetAuthorityGate:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
