import test from "node:test";
import assert from "node:assert/strict";
import {
  createNativePwrcTransferFeeEpochEvidence,
  assertNativePwrcTransferFeeEpochEvidenceFresh,
} from "../packages/protocol/src/native-transfer-fee-evidence.js";
import {
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_TRANSFER_FEE_BPS,
} from "../packages/protocol/src/constants.js";

const evidence =
  createNativePwrcTransferFeeEpochEvidence({
    epoch:
      900n,
    observedSlot:
      1000n,
    observedAt:
      "2026-08-15T00:00:00.000Z",
    transferFeeBasisPoints:
      PWRC_TRANSFER_FEE_BPS,
    maximumTransferFeeBaseUnits:
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
    transferFeeConfigAuthority:
      null,
    withdrawWithheldAuthority:
      null,
  });

test(
  "native transfer fee evidence is deterministic and fresh in the same epoch",
  () => {
    assert.match(
      evidence.evidenceSha256,
      /^[a-f0-9]{64}$/,
    );

    assert.doesNotThrow(
      () =>
        assertNativePwrcTransferFeeEpochEvidenceFresh(
          evidence,
          {
            now:
              "2026-08-15T00:00:30.000Z",
            currentEpoch:
              900n,
            currentSlot:
              1010n,
          },
        ),
    );
  },
);

test(
  "native transfer fee evidence fails after epoch transition or excessive slot lag",
  () => {
    assert.throws(
      () =>
        assertNativePwrcTransferFeeEpochEvidenceFresh(
          evidence,
          {
            now:
              "2026-08-15T00:00:30.000Z",
            currentEpoch:
              901n,
            currentSlot:
              1010n,
          },
        ),
      /PWRC_NATIVE_FEE_EVIDENCE_EPOCH_CHANGED/,
    );

    assert.throws(
      () =>
        assertNativePwrcTransferFeeEpochEvidenceFresh(
          evidence,
          {
            now:
              "2026-08-15T00:00:30.000Z",
            currentEpoch:
              900n,
            currentSlot:
              1200n,
            maxSlotLag:
              128n,
          },
        ),
      /PWRC_NATIVE_FEE_EVIDENCE_SLOT_LAG_EXCEEDED/,
    );
  },
);

test(
  "native transfer fee evidence rejects canonical policy drift",
  () => {
    assert.throws(
      () =>
        createNativePwrcTransferFeeEpochEvidence({
          epoch:
            900n,
          observedSlot:
            1000n,
          observedAt:
            "2026-08-15T00:00:00.000Z",
          transferFeeBasisPoints:
            PWRC_TRANSFER_FEE_BPS +
            1n,
          maximumTransferFeeBaseUnits:
            PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
          transferFeeConfigAuthority:
            null,
          withdrawWithheldAuthority:
            null,
        }),
      /PWRC_NATIVE_FEE_EVIDENCE_BPS_MISMATCH/,
    );
  },
);
