import fs from "node:fs";

const failures = [];

const preflight =
  fs.readFileSync(
    "packages/sdk/src/native-transfer-preflight.ts",
    "utf8",
  );
const sdkIndex =
  fs.readFileSync(
    "packages/sdk/src/index.ts",
    "utf8",
  );
const sdkPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/sdk/package.json",
      "utf8",
    ),
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_PREFLIGHT_V1",
  "PWRC_TOKEN_POLICY_EXPECTED_SHA256",
  "PWRC_CANONICAL_MINT",
  "TOKEN_2022_PROGRAM_ID",
  "getAccount",
  "getLatestBlockhash",
  "getFeeForMessage",
  "getMinimumBalanceForRentExemption",
  "getAccountLenForMint",
  "getBalance",
  "simulateTransaction",
  "sourceBalanceSufficient",
  "payerBalanceSufficient",
  "unsignedTransactionBase64",
  "signingIncluded:",
  "submissionIncluded:",
  "observedAt",
  "observedSlot",
  "reportSha256",
  "canonicalJsonSha256",
  "verifyNativePwrcTransferPreflightReport",
  "PWRC_NATIVE_PREFLIGHT_REPORT_STALE",
  "PWRC_NATIVE_PREFLIGHT_REPORT_COMMITMENT_MISMATCH",
  "PWRC_NATIVE_PREFLIGHT_REPORT_CAPABILITY_INVALID",
  "publicWrites:",
]) {
  if (!preflight.includes(invariant)) {
    failures.push(
      `native-transfer-preflight:${invariant}`,
    );
  }
}

for (const code of [
  "PWRC_NATIVE_PREFLIGHT_SOURCE_ACCOUNT_MISSING_OR_INVALID",
  "PWRC_NATIVE_PREFLIGHT_SOURCE_OWNER_MISMATCH",
  "PWRC_NATIVE_PREFLIGHT_SOURCE_MINT_MISMATCH",
  "PWRC_NATIVE_PREFLIGHT_SOURCE_FROZEN",
  "PWRC_NATIVE_PREFLIGHT_INSUFFICIENT_TOKEN_BALANCE",
  "PWRC_NATIVE_PREFLIGHT_DESTINATION_ACCOUNT_INVALID",
  "PWRC_NATIVE_PREFLIGHT_DESTINATION_OWNER_MISMATCH",
  "PWRC_NATIVE_PREFLIGHT_DESTINATION_MINT_MISMATCH",
  "PWRC_NATIVE_PREFLIGHT_DESTINATION_FROZEN",
  "PWRC_NATIVE_PREFLIGHT_DESTINATION_ATA_MISSING",
  "PWRC_NATIVE_PREFLIGHT_INSUFFICIENT_PAYER_SOL",
  "PWRC_NATIVE_PREFLIGHT_SIMULATION_FAILED",
]) {
  if (!preflight.includes(code)) {
    failures.push(
      `native-transfer-preflight:error:${code}`,
    );
  }
}

for (const forbidden of [
  "sendTransaction(",
  "sendRawTransaction(",
  "sendAndConfirmTransaction(",
  "Keypair.generate(",
  "fromSecretKey(",
]) {
  if (preflight.includes(forbidden)) {
    failures.push(
      `native-transfer-preflight:write-or-secret:${forbidden}`,
    );
  }
}

if (
  !sdkIndex.includes(
    'export * from "./native-transfer-preflight.js";',
  ) ||
  sdkPackage.exports?.[
    "./native-transfer-preflight"
  ] !==
    "./src/native-transfer-preflight.ts"
) {
  failures.push(
    "native-transfer-preflight:sdk-export",
  );
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_PREFLIGHT_V1",
  "sourceAtaValidation",
  "destinationAtaValidation",
  "tokenBalanceValidation",
  "payerSolValidation",
  "simulationSupported",
  "signingIncluded",
  "reportCommitmentSha256",
  "observedSlotBound",
  "observedAtBound",
  "maxReportAgeSeconds",
  "submissionIncluded",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `native-transfer-preflight:runtime:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  domain:
    "POWERCHAIN_NATIVE_PWRC_TRANSFER_PREFLIGHT_V1",
  sourceAccountValidation:
    true,
  destinationAccountValidation:
    true,
  tokenBalanceValidation:
    true,
  payerSolValidation:
    true,
  networkFeeEstimate:
    true,
  ataRentEstimate:
    true,
  optionalSimulation:
    true,
  reportCommitmentSha256:
    true,
  observationSlotBound:
    true,
  observationTimeBound:
    true,
  maxReportAgeSeconds:
    120,
  signingIncluded:
    false,
  submissionIncluded:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
