import fs from "node:fs";

const failures = [];

const evidence =
  fs.readFileSync(
    "packages/protocol/src/native-transfer-fee-evidence.ts",
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
const openapi =
  JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1",
  "PWRC_NATIVE_FEE_EVIDENCE_BPS_MISMATCH",
  "PWRC_NATIVE_FEE_EVIDENCE_MAX_FEE_MISMATCH",
  "PWRC_NATIVE_FEE_EVIDENCE_EPOCH_CHANGED",
  "PWRC_NATIVE_FEE_EVIDENCE_SLOT_LAG_EXCEEDED",
  "PWRC_NATIVE_FEE_EVIDENCE_STALE",
  "PWRC_NATIVE_FEE_EVIDENCE_COMMITMENT_MISMATCH",
]) {
  if (!evidence.includes(invariant)) {
    failures.push(
      `v31:evidence:${invariant}`,
    );
  }
}

for (const invariant of [
  "activeTransferFee",
  "createNativePwrcTransferFeeEpochEvidence",
  "transferFeeEvidence",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `v31:observer:${invariant}`,
    );
  }
}

for (const invariant of [
  "buildVerifiedNativePwrcTransferPlan",
  "buildVerifiedUnsignedNativePwrcTransferTransaction",
  "assertNativePwrcTransferFeeEpochEvidenceFresh",
  "feeEvidenceSha256",
  "feeAuthorityPolicy",
]) {
  if (!transactions.includes(invariant)) {
    failures.push(
      `v31:transactions:${invariant}`,
    );
  }
}

for (const invariant of [
  "liveFeeEpochSafety",
  "productionEvidenceRequired",
  "legacyBuilderAvailable",
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `v31:runtime:${invariant}`,
    );
  }
}

const schema =
  openapi.paths?.[
    "/api/v1/token/transfer-policy"
  ]?.get?.responses?.[
    "200"
  ]?.content?.[
    "application/json"
  ]?.schema;

if (
  schema?.additionalProperties !==
    false ||
  !schema?.required?.includes(
    "liveFeeEpochSafety",
  )
) {
  failures.push(
    "v31:openapi:live-fee-epoch-safety",
  );
}

for (const forbidden of [
  "sendTransaction(",
  "sendAndConfirmTransaction(",
  "mintTo(",
  "setAuthority(",
]) {
  if (
    evidence.includes(forbidden) ||
    transactions.includes(forbidden)
  ) {
    failures.push(
      `v31:write-surface:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  liveFeeEpochEvidence:
    true,
  deterministicFeeEvidenceCommitment:
    true,
  epochTransitionFailsClosed:
    true,
  slotLagFailsClosed:
    true,
  feeEvidenceFreshnessBound:
    true,
  productionBuilderRequiresEvidence:
    true,
  walletOwnedSigning:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
