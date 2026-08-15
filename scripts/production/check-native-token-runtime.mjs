import fs from "node:fs";

const failures = [];

const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const helius =
  fs.readFileSync(
    "packages/sdk/src/helius-client.ts",
    "utf8",
  );
const utility =
  fs.readFileSync(
    "packages/protocol/src/utility.ts",
    "utf8",
  );
const compute =
  fs.readFileSync(
    "packages/protocol/src/compute-security.ts",
    "utf8",
  );
const metaplex =
  fs.readFileSync(
    "packages/metaplex/src/compatibility.ts",
    "utf8",
  );
const tokenRuntime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );
const nativeAttestation =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const metadata =
  JSON.parse(
    fs.readFileSync(
      "metadata/metadata.json",
      "utf8",
    ),
  );

for (const invariant of [
  "createTransferCheckedWithFeeInstruction",
  "createAssociatedTokenAccountIdempotentInstruction",
  "TOKEN_2022_PROGRAM_ID",
  "nativePwrcTransferPreview",
  "buildUnsignedNativePwrcTransferTransaction",
  "serializeUnsignedNativePwrcTransaction",
  "PWRC_NATIVE_TRANSFER_SELF_TRANSFER_FORBIDDEN",
  "submissionIncluded:",
  "false",
]) {
  if (!transactions.includes(invariant)) {
    failures.push(
      `native-runtime:transactions:${invariant}`,
    );
  }
}

for (const forbidden of [
  "sendAndConfirmTransaction(",
  "sendTransaction(",
  "Keypair.generate(",
  "fromSecretKey(",
]) {
  if (transactions.includes(forbidden)) {
    failures.push(
      `native-runtime:transaction-secret-or-submit:${forbidden}`,
    );
  }
}

for (const invariant of [
  "getPriorityFeeEstimate",
  "priorityFeeEstimate",
  "Medium",
  "transactionEncoding",
  "Base64",
  "PWRC_HELIUS_PRIORITY_FEE_INPUT_REQUIRED",
]) {
  if (!helius.includes(invariant)) {
    failures.push(
      `native-runtime:priority-fee:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_PWRC_UTILITY_AUTHORIZATION_V1",
  "idempotencyKey",
  "maxSpendBaseUnits",
  "PWRC_UTILITY_MAX_SPEND_EXCEEDED",
]) {
  if (!utility.includes(invariant)) {
    failures.push(
      `native-runtime:utility:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_COMPUTE_RATE_LIMITED",
  "PWRC_COMPUTE_CONCURRENCY_LIMITED",
  "PWRC_COMPUTE_PAYLOAD_TOO_LARGE",
  "PWRC_COMPUTE_BUDGET_EXCEEDED",
  "PWRC_COMPUTE_DUPLICATE_REQUEST",
]) {
  if (!compute.includes(invariant)) {
    failures.push(
      `native-runtime:compute-security:${invariant}`,
    );
  }
}

for (const invariant of [
  "Fungible",
  "SOLANA_TOKEN_2022_PROGRAM_ID",
  "METAPLEX_TOKEN_METADATA_PROGRAM_ID",
  "PWRC_METAPLEX_TOKEN2022_PROGRAM_MISMATCH",
]) {
  if (!metaplex.includes(invariant)) {
    failures.push(
      `native-runtime:metaplex:${invariant}`,
    );
  }
}

for (const invariant of [
  "dexTransferCompatible:",
  "tradeability:",
  "integration-ready",
  "exchangeListingVerified:",
  "liquidityConfigured:",
  "TransferCheckedWithFee",
  "walletOwned:",
  "true",
  "serverPrivateKeys:",
  "false",
  "blindRetry:",
  "1000000",
  "400000",
  "transactionSafetyCeilings",
  "false",
  "ai-inference",
  "duplicateRequestRejection:",
]) {
  if (!tokenRuntime.includes(invariant)) {
    failures.push(
      `native-runtime:policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "attestationInFlight",
  "attestationCache",
  "PWRC_NATIVE_ATTESTATION_CACHE_MS",
  "shared-flight",
]) {
  if (!nativeAttestation.includes(invariant)) {
    failures.push(
      `native-runtime:attestation-scale:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_EXPENSIVE_API_RATE_LIMIT",
  "expensivePaths",
  "PWRC_EXPENSIVE_ROUTE_RATE_LIMITED",
  "/api/v1/token/native-attestation",
]) {
  if (!server.includes(invariant)) {
    failures.push(
      `native-runtime:spam-protection:${invariant}`,
    );
  }
}

if (
  metadata.name !==
    "PowerChain" ||
  metadata.symbol !==
    "PWRC" ||
  metadata.image !==
    "https://token.powerchain.energy/assets/tokens/pwrc-logo.png"
) {
  failures.push(
    "native-runtime:metadata-json",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  token2022Transfers:
    true,
  transferFeeAware:
    true,
  unsignedWalletSigning:
    true,
  heliusPriorityFees:
    true,
  metaplexFungibleCompatibility:
    true,
  utilityAuthorization:
    true,
  computeSpamProtection:
    true,
  attestationSingleFlight:
    true,
  expensiveRouteRateLimit:
    true,
  publicTokenWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
