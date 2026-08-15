import {
  canonicalJsonSha256,
} from "./helpers.js";
import {
  PWRC_TOKEN_POLICY_EXPECTED_SHA256,
} from "./token-policy.js";
import {
  verifyNativePwrcTransferIntent,
  type NativePwrcTransferIntent,
} from "./native-transfer-intent.js";
import {
  type NativePwrcTransferFeeEpochEvidence,
} from "./native-transfer-fee-evidence.js";

const VERIFIED_TRANSFER_INTENT_DOMAIN =
  "POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1" as const;

export interface NativePwrcVerifiedTransferIntentInput {
  intent:
    NativePwrcTransferIntent;
  feeEvidence:
    NativePwrcTransferFeeEpochEvidence;
  feeAuthorityPolicySha256:
    string;
}

export interface NativePwrcVerifiedTransferIntent {
  version:
    "1.0.0";
  domain:
    "POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1";
  tokenPolicySha256:
    string;
  baseIntentSha256:
    string;
  feeEvidenceSha256:
    string;
  observedEpoch:
    string;
  observedSlot:
    string;
  feeAuthorityPolicySha256:
    string;
  verifiedIntentSha256:
    string;
}

function sha256(
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

function canonicalUnsignedInteger(
  value:
    string,
  code:
    string,
): string {
  if (
    !/^(0|[1-9][0-9]*)$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }

  return value;
}

function commitment(
  payload:
    Omit<
      NativePwrcVerifiedTransferIntent,
      "verifiedIntentSha256"
    >,
): string {
  return canonicalJsonSha256({
    domain:
      VERIFIED_TRANSFER_INTENT_DOMAIN,
    verifiedIntent:
      payload,
  });
}

export function createNativePwrcVerifiedTransferIntent(
  input:
    NativePwrcVerifiedTransferIntentInput,
): NativePwrcVerifiedTransferIntent {
  const intent =
    verifyNativePwrcTransferIntent(
      input.intent,
    );

  const payload = {
    version:
      "1.0.0" as const,
    domain:
      VERIFIED_TRANSFER_INTENT_DOMAIN,
    tokenPolicySha256:
      PWRC_TOKEN_POLICY_EXPECTED_SHA256,
    baseIntentSha256:
      sha256(
        intent.intentSha256,
        "PWRC_NATIVE_VERIFIED_INTENT_BASE_SHA_INVALID",
      ),
    feeEvidenceSha256:
      sha256(
        input.feeEvidence.evidenceSha256,
        "PWRC_NATIVE_VERIFIED_INTENT_FEE_EVIDENCE_SHA_INVALID",
      ),
    observedEpoch:
      canonicalUnsignedInteger(
        input.feeEvidence.epoch,
        "PWRC_NATIVE_VERIFIED_INTENT_EPOCH_INVALID",
      ),
    observedSlot:
      canonicalUnsignedInteger(
        input.feeEvidence.observedSlot,
        "PWRC_NATIVE_VERIFIED_INTENT_SLOT_INVALID",
      ),
    feeAuthorityPolicySha256:
      sha256(
        input.feeAuthorityPolicySha256,
        "PWRC_NATIVE_VERIFIED_INTENT_AUTHORITY_POLICY_SHA_INVALID",
      ),
  };

  return {
    ...payload,
    verifiedIntentSha256:
      commitment(
        payload,
      ),
  };
}

export function verifyNativePwrcVerifiedTransferIntent(
  verified:
    NativePwrcVerifiedTransferIntent,
): NativePwrcVerifiedTransferIntent {
  if (
    verified.version !==
      "1.0.0" ||
    verified.domain !==
      VERIFIED_TRANSFER_INTENT_DOMAIN
  ) {
    throw new Error(
      "PWRC_NATIVE_VERIFIED_INTENT_VERSION_INVALID",
    );
  }

  if (
    verified.tokenPolicySha256 !==
      PWRC_TOKEN_POLICY_EXPECTED_SHA256
  ) {
    throw new Error(
      "PWRC_NATIVE_VERIFIED_INTENT_TOKEN_POLICY_MISMATCH",
    );
  }

  sha256(
    verified.baseIntentSha256,
    "PWRC_NATIVE_VERIFIED_INTENT_BASE_SHA_INVALID",
  );
  sha256(
    verified.feeEvidenceSha256,
    "PWRC_NATIVE_VERIFIED_INTENT_FEE_EVIDENCE_SHA_INVALID",
  );
  sha256(
    verified.feeAuthorityPolicySha256,
    "PWRC_NATIVE_VERIFIED_INTENT_AUTHORITY_POLICY_SHA_INVALID",
  );
  sha256(
    verified.verifiedIntentSha256,
    "PWRC_NATIVE_VERIFIED_INTENT_SHA_INVALID",
  );
  canonicalUnsignedInteger(
    verified.observedEpoch,
    "PWRC_NATIVE_VERIFIED_INTENT_EPOCH_INVALID",
  );
  canonicalUnsignedInteger(
    verified.observedSlot,
    "PWRC_NATIVE_VERIFIED_INTENT_SLOT_INVALID",
  );

  const {
    verifiedIntentSha256,
    ...payload
  } =
    verified;

  if (
    verifiedIntentSha256 !==
      commitment(
        payload,
      )
  ) {
    throw new Error(
      "PWRC_NATIVE_VERIFIED_INTENT_COMMITMENT_MISMATCH",
    );
  }

  return verified;
}
