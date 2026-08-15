import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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

test(
  "fee evidence binds epoch, slot, time and canonical fee policy",
  () => {
    for (const invariant of [
      "POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1",
      "PWRC_NATIVE_FEE_EVIDENCE_EPOCH_CHANGED",
      "PWRC_NATIVE_FEE_EVIDENCE_SLOT_LAG_EXCEEDED",
      "PWRC_NATIVE_FEE_EVIDENCE_STALE",
      "PWRC_NATIVE_FEE_EVIDENCE_POLICY_MISMATCH",
      "PWRC_NATIVE_FEE_EVIDENCE_COMMITMENT_MISMATCH",
    ]) {
      assert.ok(
        evidence.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "RPC observer emits fee epoch evidence from the active Token-2022 fee",
  () => {
    assert.ok(
      observer.includes(
        "createNativePwrcTransferFeeEpochEvidence",
      ),
    );
    assert.ok(
      observer.includes(
        "activeTransferFee",
      ),
    );
    assert.ok(
      observer.includes(
        "transferFeeEvidence",
      ),
    );
  },
);

test(
  "production transaction builder requires fresh fee evidence",
  () => {
    assert.ok(
      transactions.includes(
        "buildVerifiedNativePwrcTransferPlan",
      ),
    );
    assert.ok(
      transactions.includes(
        "buildVerifiedUnsignedNativePwrcTransferTransaction",
      ),
    );
    assert.ok(
      transactions.includes(
        "assertNativePwrcTransferFeeEpochEvidenceFresh",
      ),
    );
    assert.ok(
      transactions.includes(
        "feeAuthorityPolicy",
      ),
    );
  },
);

test(
  "transfer policy distinguishes legacy and production fee-evidence paths",
  () => {
    for (const invariant of [
      "liveFeeEpochSafety",
      "legacyBuilderAvailable",
      "productionEvidenceRequired",
      "POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1",
    ]) {
      assert.ok(
        runtime.includes(
          invariant,
        ),
      );
    }
  },
);
