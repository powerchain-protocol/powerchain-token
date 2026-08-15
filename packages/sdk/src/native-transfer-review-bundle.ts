import {
  canonicalJsonSha256,
} from "@powerchain/protocol/helpers";
import {
  PWRC_TOKEN_POLICY_EXPECTED_SHA256,
} from "@powerchain/protocol/token-policy";
import {
  assertNativePwrcTransferFeeEpochEvidenceFresh,
  type NativePwrcTransferFeeEpochEvidence,
} from "@powerchain/protocol/native-transfer-fee-evidence";
import {
  assertNativePwrcTransferIntentFresh,
  verifyNativePwrcTransferIntent,
  type NativePwrcTransferIntent,
} from "@powerchain/protocol/native-transfer-intent";
import {
  type NativePwrcTransferFeeAuthorityPolicy,
} from "@powerchain/protocol/native-token";
import {
  verifyNativePwrcVerifiedTransferIntent,
  type NativePwrcVerifiedTransferIntent,
} from "@powerchain/protocol/native-verified-transfer-intent";
import {
  type Transaction,
} from "@solana/web3.js";
import {
  reviewUnsignedNativePwrcTransaction,
  serializeUnsignedNativePwrcTransaction,
} from "./native-token-transactions.js";
import {
  verifyNativePwrcTransferPreflightReport,
  type NativePwrcTransferPreflightReport,
} from "./native-transfer-preflight.js";

const REVIEW_BUNDLE_DOMAIN =
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1" as const;

export interface NativePwrcTransferReviewBundleInput {
  transaction:
    Transaction;
  intent:
    NativePwrcTransferIntent;
  verifiedIntent:
    NativePwrcVerifiedTransferIntent;
  feeEvidence:
    NativePwrcTransferFeeEpochEvidence;
  feeAuthorityPolicy:
    NativePwrcTransferFeeAuthorityPolicy;
  feeAuthorityPolicySha256:
    string;
  preflight:
    NativePwrcTransferPreflightReport;
  now:
    string;
  currentEpoch:
    bigint;
  currentSlot:
    bigint;
  currentBlockHeight?:
    bigint;
  maxFeeEvidenceAgeMs?:
    number;
  maxFeeEvidenceSlotLag?:
    bigint;
  maxPreflightAgeMs?:
    number;
}

export interface NativePwrcTransferReviewBundle {
  version:
    "1.0.0";
  domain:
    "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1";
  tokenPolicySha256:
    string;
  intentSha256:
    string;
  verifiedIntentSha256:
    string;
  feeEvidenceSha256:
    string;
  feeAuthorityPolicySha256:
    string;
  preflightReportSha256:
    string;
  unsignedMessageSha256:
    string;
  reviewedAt:
    string;
  currentEpoch:
    string;
  currentSlot:
    string;
  currentBlockHeight:
    string |
    null;
  valid:
    boolean;
  failures:
    readonly string[];
  signingIncluded:
    false;
  submissionIncluded:
    false;
  authorizationIncluded:
    false;
  publicWrites:
    false;
  bundleSha256:
    string;
}

function assertSha256(
  value:
    string,
  code:
    string,
): string {
  if (
    !/^[a-f0-9]{64}$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }

  return value;
}

function canonicalIso(
  value:
    string,
  code:
    string,
): string {
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

  return value;
}

function bundleCommitment(
  payload:
    Omit<
      NativePwrcTransferReviewBundle,
      "bundleSha256"
    >,
): string {
  return canonicalJsonSha256({
    domain:
      REVIEW_BUNDLE_DOMAIN,
    bundle:
      payload,
  });
}

export async function createNativePwrcTransferReviewBundle(
  input:
    NativePwrcTransferReviewBundleInput,
): Promise<
  NativePwrcTransferReviewBundle
> {
  canonicalIso(
    input.now,
    "PWRC_NATIVE_REVIEW_BUNDLE_TIME_INVALID",
  );
  const feeAuthorityPolicySha256 =
    assertSha256(
      input.feeAuthorityPolicySha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_AUTHORITY_POLICY_SHA_INVALID",
    );
  const failures:
    string[] =
    [];

  let verifiedIntent:
    NativePwrcTransferIntent |
    null =
    null;

  try {
    verifiedIntent =
      verifyNativePwrcTransferIntent(
        input.intent,
      );
    assertNativePwrcTransferIntentFresh(
      verifiedIntent,
      input.now,
      input.currentBlockHeight,
    );
  } catch (
    error
  ) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_REVIEW_BUNDLE_INTENT_INVALID",
    );
  }

  let verifiedIntentEvidence:
    NativePwrcVerifiedTransferIntent |
    null =
    null;

  try {
    verifiedIntentEvidence =
      verifyNativePwrcVerifiedTransferIntent(
        input.verifiedIntent,
      );

    if (
      verifiedIntentEvidence.baseIntentSha256 !==
        input.intent.intentSha256 ||
      verifiedIntentEvidence.feeEvidenceSha256 !==
        input.feeEvidence.evidenceSha256 ||
      verifiedIntentEvidence.feeAuthorityPolicySha256 !==
        feeAuthorityPolicySha256 ||
      verifiedIntentEvidence.observedEpoch !==
        input.feeEvidence.epoch ||
      verifiedIntentEvidence.observedSlot !==
        input.feeEvidence.observedSlot
    ) {
      failures.push(
        "PWRC_NATIVE_REVIEW_BUNDLE_VERIFIED_INTENT_MISMATCH",
      );
    }
  } catch (
    error
  ) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_REVIEW_BUNDLE_VERIFIED_INTENT_INVALID",
    );
  }

  try {
    assertNativePwrcTransferFeeEpochEvidenceFresh(
      input.feeEvidence,
      {
        now:
          input.now,
        currentEpoch:
          input.currentEpoch,
        currentSlot:
          input.currentSlot,
        ...(
          input.maxFeeEvidenceAgeMs !==
            undefined
            ? {
                maxAgeMs:
                  input.maxFeeEvidenceAgeMs,
              }
            : {}
        ),
        ...(
          input.maxFeeEvidenceSlotLag !==
            undefined
            ? {
                maxSlotLag:
                  input.maxFeeEvidenceSlotLag,
              }
            : {}
        ),
        authorityPolicy:
          input.feeAuthorityPolicy,
      },
    );
  } catch (
    error
  ) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_REVIEW_BUNDLE_FEE_EVIDENCE_INVALID",
    );
  }

  let verifiedPreflight:
    NativePwrcTransferPreflightReport |
    null =
    null;

  try {
    verifiedPreflight =
      verifyNativePwrcTransferPreflightReport(
        input.preflight,
        input.now,
        input.maxPreflightAgeMs ??
          120_000,
      );

    if (
      !verifiedPreflight.valid
    ) {
      failures.push(
        "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_FAILED",
      );
    }
  } catch (
    error
  ) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_INVALID",
    );
  }

  const transactionReview =
    await reviewUnsignedNativePwrcTransaction(
      input.transaction,
      input.intent,
      input.now,
      input.currentBlockHeight,
    );

  if (
    !transactionReview.valid
  ) {
    failures.push(
      ...transactionReview.failures,
    );
  }

  if (
    verifiedPreflight
  ) {
    if (
      verifiedPreflight.owner !==
        input.intent.owner ||
      verifiedPreflight.destinationOwner !==
        input.intent.destinationOwner ||
      verifiedPreflight.payer !==
        input.intent.payer ||
      verifiedPreflight.grossBaseUnits !==
        input.intent.grossBaseUnits ||
      verifiedPreflight.nativeTransferFeeBaseUnits !==
        input.intent.nativeTransferFeeBaseUnits ||
      verifiedPreflight.netBaseUnits !==
        input.intent.netBaseUnits
    ) {
      failures.push(
        "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_INTENT_MISMATCH",
      );
    }

    if (
      verifiedPreflight.latestBlockhash !==
        input.intent.recentBlockhash ||
      verifiedPreflight.lastValidBlockHeight
        ?.toString() !==
        input.intent.lastValidBlockHeight
    ) {
      failures.push(
        "PWRC_NATIVE_REVIEW_BUNDLE_BLOCKHASH_CONTEXT_MISMATCH",
      );
    }

    const serializedTransaction =
      serializeUnsignedNativePwrcTransaction(
        input.transaction,
      );

    if (
      verifiedPreflight.unsignedTransactionBase64 !==
        serializedTransaction
    ) {
      failures.push(
        "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_TRANSACTION_MISMATCH",
      );
    }

    if (
      verifiedPreflight.observedSlot !==
        null &&
      BigInt(
        verifiedPreflight.observedSlot,
      ) >
        input.currentSlot
    ) {
      failures.push(
        "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_SLOT_FROM_FUTURE",
      );
    }
  }

  const uniqueFailures =
    [
      ...new Set(
        failures,
      ),
    ];

  const payload = {
    version:
      "1.0.0" as const,
    domain:
      REVIEW_BUNDLE_DOMAIN,
    tokenPolicySha256:
      PWRC_TOKEN_POLICY_EXPECTED_SHA256,
    intentSha256:
      assertSha256(
        input.intent.intentSha256,
        "PWRC_NATIVE_REVIEW_BUNDLE_INTENT_SHA_INVALID",
      ),
    verifiedIntentSha256:
      assertSha256(
        input.verifiedIntent.verifiedIntentSha256,
        "PWRC_NATIVE_REVIEW_BUNDLE_VERIFIED_INTENT_SHA_INVALID",
      ),
    feeEvidenceSha256:
      assertSha256(
        input.feeEvidence.evidenceSha256,
        "PWRC_NATIVE_REVIEW_BUNDLE_FEE_EVIDENCE_SHA_INVALID",
      ),
    feeAuthorityPolicySha256,
    preflightReportSha256:
      assertSha256(
        input.preflight.reportSha256,
        "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_SHA_INVALID",
      ),
    unsignedMessageSha256:
      assertSha256(
        transactionReview.messageSha256,
        "PWRC_NATIVE_REVIEW_BUNDLE_MESSAGE_SHA_INVALID",
      ),
    reviewedAt:
      input.now,
    currentEpoch:
      input.currentEpoch
        .toString(),
    currentSlot:
      input.currentSlot
        .toString(),
    currentBlockHeight:
      input.currentBlockHeight
        ?.toString() ??
      null,
    valid:
      uniqueFailures.length ===
      0,
    failures:
      uniqueFailures,
    signingIncluded:
      false as const,
    submissionIncluded:
      false as const,
    authorizationIncluded:
      false as const,
    publicWrites:
      false as const,
  };

  return {
    ...payload,
    bundleSha256:
      bundleCommitment(
        payload,
      ),
  };
}

export function verifyNativePwrcTransferReviewBundle(
  bundle:
    NativePwrcTransferReviewBundle,
): NativePwrcTransferReviewBundle {
  if (
    bundle.version !==
      "1.0.0" ||
    bundle.domain !==
      REVIEW_BUNDLE_DOMAIN
  ) {
    throw new Error(
      "PWRC_NATIVE_REVIEW_BUNDLE_VERSION_INVALID",
    );
  }

  if (
    bundle.tokenPolicySha256 !==
      PWRC_TOKEN_POLICY_EXPECTED_SHA256
  ) {
    throw new Error(
      "PWRC_NATIVE_REVIEW_BUNDLE_TOKEN_POLICY_MISMATCH",
    );
  }

  for (const [
    value,
    code,
  ] of [
    [
      bundle.intentSha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_INTENT_SHA_INVALID",
    ],
    [
      bundle.verifiedIntentSha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_VERIFIED_INTENT_SHA_INVALID",
    ],
    [
      bundle.feeEvidenceSha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_FEE_EVIDENCE_SHA_INVALID",
    ],
    [
      bundle.feeAuthorityPolicySha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_AUTHORITY_POLICY_SHA_INVALID",
    ],
    [
      bundle.preflightReportSha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_PREFLIGHT_SHA_INVALID",
    ],
    [
      bundle.unsignedMessageSha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_MESSAGE_SHA_INVALID",
    ],
    [
      bundle.bundleSha256,
      "PWRC_NATIVE_REVIEW_BUNDLE_SHA_INVALID",
    ],
  ] as const) {
    assertSha256(
      value,
      code,
    );
  }

  canonicalIso(
    bundle.reviewedAt,
    "PWRC_NATIVE_REVIEW_BUNDLE_TIME_INVALID",
  );

  if (
    bundle.signingIncluded !==
      false ||
    bundle.submissionIncluded !==
      false ||
    bundle.authorizationIncluded !==
      false ||
    bundle.publicWrites !==
      false
  ) {
    throw new Error(
      "PWRC_NATIVE_REVIEW_BUNDLE_CAPABILITY_INVALID",
    );
  }

  const {
    bundleSha256,
    ...payload
  } =
    bundle;
  const expected =
    bundleCommitment(
      payload,
    );

  if (
    bundleSha256 !==
      expected
  ) {
    throw new Error(
      "PWRC_NATIVE_REVIEW_BUNDLE_COMMITMENT_MISMATCH",
    );
  }

  return bundle;
}
