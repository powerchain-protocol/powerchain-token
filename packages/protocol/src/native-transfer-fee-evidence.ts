import {
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_TRANSFER_FEE_BPS,
  PWRC_VERSION,
} from "./constants.js";
import {
  assertSolana32ByteBase58,
  canonicalJsonSha256,
} from "./helpers.js";
import {
  type NativePwrcTransferFeeAuthorityPolicy,
} from "./native-token.js";

export interface NativePwrcTransferFeeEpochEvidenceInput {
  epoch:
    bigint;
  observedSlot:
    bigint;
  observedAt:
    string;
  transferFeeBasisPoints:
    bigint;
  maximumTransferFeeBaseUnits:
    bigint;
  transferFeeConfigAuthority:
    string |
    null;
  withdrawWithheldAuthority:
    string |
    null;
}

export interface NativePwrcTransferFeeEpochEvidence {
  version:
    "1.0.0";
  epoch:
    string;
  observedSlot:
    string;
  observedAt:
    string;
  transferFeeBasisPoints:
    string;
  maximumTransferFeeBaseUnits:
    string;
  transferFeeConfigAuthority:
    string |
    null;
  withdrawWithheldAuthority:
    string |
    null;
  evidenceSha256:
    string;
}

function assertIso(
  value:
    string,
  code:
    string,
): number {
  const parsed =
    Date.parse(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    new Date(
      parsed,
    ).toISOString() !==
      value
  ) {
    throw new Error(
      code,
    );
  }

  return parsed;
}

function canonicalAuthority(
  value:
    string |
    null,
  code:
    string,
): string |
  null {
  return value ===
    null
    ? null
    : assertSolana32ByteBase58(
        value,
        code,
      );
}

export function createNativePwrcTransferFeeEpochEvidence(
  input:
    NativePwrcTransferFeeEpochEvidenceInput,
): NativePwrcTransferFeeEpochEvidence {
  if (
    input.epoch <
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_EPOCH_INVALID",
    );
  }

  if (
    input.observedSlot <
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_SLOT_INVALID",
    );
  }

  assertIso(
    input.observedAt,
    "PWRC_NATIVE_FEE_EVIDENCE_OBSERVED_AT_INVALID",
  );

  if (
    input.transferFeeBasisPoints !==
      PWRC_TRANSFER_FEE_BPS
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_BPS_MISMATCH",
    );
  }

  if (
    input.maximumTransferFeeBaseUnits !==
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_MAX_FEE_MISMATCH",
    );
  }

  const payload = {
    version:
      PWRC_VERSION,
    epoch:
      input.epoch
        .toString(),
    observedSlot:
      input.observedSlot
        .toString(),
    observedAt:
      input.observedAt,
    transferFeeBasisPoints:
      input.transferFeeBasisPoints
        .toString(),
    maximumTransferFeeBaseUnits:
      input.maximumTransferFeeBaseUnits
        .toString(),
    transferFeeConfigAuthority:
      canonicalAuthority(
        input.transferFeeConfigAuthority,
        "PWRC_NATIVE_FEE_EVIDENCE_CONFIG_AUTHORITY_INVALID",
      ),
    withdrawWithheldAuthority:
      canonicalAuthority(
        input.withdrawWithheldAuthority,
        "PWRC_NATIVE_FEE_EVIDENCE_WITHDRAW_AUTHORITY_INVALID",
      ),
  };

  return {
    ...payload,
    evidenceSha256:
      canonicalJsonSha256({
        domain:
          "POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1",
        evidence:
          payload,
      }),
  };
}

export interface NativePwrcTransferFeeEvidenceFreshnessInput {
  now:
    string;
  currentEpoch:
    bigint;
  currentSlot:
    bigint;
  maxAgeMs?:
    number;
  maxSlotLag?:
    bigint;
  authorityPolicy?:
    NativePwrcTransferFeeAuthorityPolicy;
}

export function assertNativePwrcTransferFeeEpochEvidenceFresh(
  evidence:
    NativePwrcTransferFeeEpochEvidence,
  input:
    NativePwrcTransferFeeEvidenceFreshnessInput,
): void {
  const nowMs =
    assertIso(
      input.now,
      "PWRC_NATIVE_FEE_EVIDENCE_NOW_INVALID",
    );
  const observedAtMs =
    assertIso(
      evidence.observedAt,
      "PWRC_NATIVE_FEE_EVIDENCE_OBSERVED_AT_INVALID",
    );
  const maxAgeMs =
    input.maxAgeMs ??
    60_000;
  const maxSlotLag =
    input.maxSlotLag ??
    128n;

  if (
    !Number.isSafeInteger(
      maxAgeMs,
    ) ||
    maxAgeMs <
      0 ||
    maxAgeMs >
      5 * 60_000
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_MAX_AGE_INVALID",
    );
  }

  if (
    maxSlotLag <
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_MAX_SLOT_LAG_INVALID",
    );
  }

  if (
    nowMs <
      observedAtMs ||
    nowMs -
      observedAtMs >
      maxAgeMs
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_STALE",
    );
  }

  if (
    BigInt(
      evidence.epoch,
    ) !==
      input.currentEpoch
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_EPOCH_CHANGED",
    );
  }

  const observedSlot =
    BigInt(
      evidence.observedSlot,
    );

  if (
    input.currentSlot <
      observedSlot ||
    input.currentSlot -
      observedSlot >
      maxSlotLag
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_SLOT_LAG_EXCEEDED",
    );
  }

  if (
    evidence.transferFeeBasisPoints !==
      PWRC_TRANSFER_FEE_BPS
        .toString() ||
    evidence.maximumTransferFeeBaseUnits !==
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS
        .toString()
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_POLICY_MISMATCH",
    );
  }

  if (
    input.authorityPolicy
  ) {
    if (
      evidence.transferFeeConfigAuthority !==
        input.authorityPolicy
          .transferFeeConfigAuthority
    ) {
      throw new Error(
        "PWRC_NATIVE_FEE_EVIDENCE_CONFIG_AUTHORITY_MISMATCH",
      );
    }

    if (
      evidence.withdrawWithheldAuthority !==
        input.authorityPolicy
          .withdrawWithheldAuthority
    ) {
      throw new Error(
        "PWRC_NATIVE_FEE_EVIDENCE_WITHDRAW_AUTHORITY_MISMATCH",
      );
    }
  }

  const expected =
    createNativePwrcTransferFeeEpochEvidence({
      epoch:
        BigInt(
          evidence.epoch,
        ),
      observedSlot:
        BigInt(
          evidence.observedSlot,
        ),
      observedAt:
        evidence.observedAt,
      transferFeeBasisPoints:
        BigInt(
          evidence.transferFeeBasisPoints,
        ),
      maximumTransferFeeBaseUnits:
        BigInt(
          evidence.maximumTransferFeeBaseUnits,
        ),
      transferFeeConfigAuthority:
        evidence.transferFeeConfigAuthority,
      withdrawWithheldAuthority:
        evidence.withdrawWithheldAuthority,
    });

  if (
    expected.evidenceSha256 !==
      evidence.evidenceSha256
  ) {
    throw new Error(
      "PWRC_NATIVE_FEE_EVIDENCE_COMMITMENT_MISMATCH",
    );
  }
}
