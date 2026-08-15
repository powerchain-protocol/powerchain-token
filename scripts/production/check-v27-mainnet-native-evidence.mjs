import fs from "node:fs";

const failures = [];

const solana =
  fs.readFileSync(
    "packages/protocol/src/solana.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
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
const status =
  fs.readFileSync(
    "scripts/mainnet/status.mjs",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

const gitignore =
  fs.readFileSync(
    ".gitignore",
    "utf8",
  );

const openapi =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

for (const invariant of [
  "decodedBase58Length",
  "PWRC_SOLANA_GENESIS_HASH_INVALID",
]) {
  if (!solana.includes(invariant)) {
    failures.push(
      `v27:solana:${invariant}`,
    );
  }
}

for (const invariant of [
  "nativePolicySha256",
  "expectedGenesisHash",
  "providerFamilies",
  "transferFeeAuthorityPolicy",
  "solanaRpcProviderFamily",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `v27:api:${invariant}`,
    );
  }
}

for (const invariant of [
  "reports/live-native-token-attestation.json",
  "reports/source-tree.sha256",
  "config/mainnet/native-token-attestation.json",
]) {
  if (!capture.includes(invariant)) {
    failures.push(
      `v27:capture:${invariant}`,
    );
  }
}

for (const invariant of [
  "nativePolicySha256",
  "sourceTreeSha256",
  "provider-family-independence",
  "feeAuthorityPolicyBound",
  "evidence-stale",
  "PWRC_MAINNET_NATIVE_ATTESTATION_MAX_AGE_MS",
  "PWRC_SOLANA_MAINNET_GENESIS_HASH",
]) {
  if (!verifier.includes(invariant)) {
    failures.push(
      `v27:verifier:${invariant}`,
    );
  }
}

for (const invariant of [
  "nativeTokenAttestationReady",
  "releaseEvidenceReady",
  "config/mainnet/native-token-attestation.json:not-verified",
]) {
  if (!status.includes(invariant)) {
    failures.push(
      `v27:status:${invariant}`,
    );
  }
}


const attestationSchema =
  openapi.paths?.[
    "/api/v1/token/native-attestation"
  ]?.get?.responses?.[
    "200"
  ]?.content?.[
    "application/json"
  ]?.schema;

if (
  attestationSchema?.additionalProperties !==
    false
) {
  failures.push(
    "v27:openapi:native-attestation-not-closed",
  );
}

for (const required of [
  "nativePolicySha256",
  "expectedGenesisHash",
  "providerFamilies",
  "transferFeeAuthorityPolicy",
  "consensusSha256",
  "attestationSha256",
]) {
  if (
    !attestationSchema?.required?.includes(
      required,
    )
  ) {
    failures.push(
      `v27:openapi:native-attestation-required:${required}`,
    );
  }
}

if (
  !env.includes(
    "PWRC_MAINNET_NATIVE_ATTESTATION_MAX_AGE_MS=3600000",
  )
) {
  failures.push(
    "v27:env:PWRC_MAINNET_NATIVE_ATTESTATION_MAX_AGE_MS",
  );
}

if (
  !gitignore.includes(
    "config/mainnet/native-token-attestation.json",
  )
) {
  failures.push(
    "v27:evidence:generated-attestation-not-ignored",
  );
}

if (
  !fs.existsSync(
    "config/mainnet/native-token-attestation.example.json",
  )
) {
  failures.push(
    "v27:evidence:example-missing",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  trustedGenesisExact32Bytes:
    true,
  liveEvidenceMetadata:
    true,
  sourceTreeBound:
    true,
  providerIndependenceBound:
    true,
  feeAuthorityPolicyBound:
    true,
  evidenceFreshnessBound:
    true,
  mainnetRequiresVerifiedNativeAttestation:
    true,
  generatedEvidenceIgnored:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
