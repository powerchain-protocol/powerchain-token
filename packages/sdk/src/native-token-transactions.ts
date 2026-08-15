import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedWithFeeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_TX_COMPUTE_UNIT_LIMIT_MAX,
  PWRC_TX_PRIORITY_FEE_MICROLAMPORTS_MAX,
  PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX,
} from "@powerchain/protocol/constants";
import {
  PWRC_TOKEN_POLICY_EXPECTED_SHA256,
} from "@powerchain/protocol/token-policy";
import {
  nativePwrcTransferPreview,
  type NativePwrcTransferFeeAuthorityPolicy,
} from "@powerchain/protocol/native-token";
import {
  assertSolana32ByteBase58,
} from "@powerchain/protocol/helpers";
import {
  assertNativePwrcTransferFeeEpochEvidenceFresh,
  type NativePwrcTransferFeeEpochEvidence,
} from "@powerchain/protocol/native-transfer-fee-evidence";
import {
  assertNativePwrcTransferIntentFresh,
  createNativePwrcTransferIntent,
  verifyNativePwrcTransferIntent,
  type NativePwrcTransferIntent,
  type NativePwrcTransferIntentInput,
} from "@powerchain/protocol/native-transfer-intent";

export interface NativePwrcTransferPlanInput {
  owner:
    string;
  destinationOwner:
    string;
  payer?:
    string;
  amountBaseUnits:
    bigint;
  ensureDestinationAta?:
    boolean;
  feeEvidence?:
    NativePwrcTransferFeeEpochEvidence;
}

export interface NativePwrcTransferPlan {
  version:
    "1.0.0";
  mint:
    string;
  tokenPolicySha256:
    string;
  tokenProgram:
    string;
  owner:
    string;
  destinationOwner:
    string;
  payer:
    string;
  sourceAta:
    string;
  destinationAta:
    string;
  grossBaseUnits:
    string;
  nativeTransferFeeBaseUnits:
    string;
  netBaseUnits:
    string;
  decimals:
    9;
  ensureDestinationAta:
    boolean;
  instructionCount:
    number;
  instructions:
    readonly TransactionInstruction[];
  requiresOwnerSignature:
    true;
  requiresPayerSignature:
    true;
  submissionIncluded:
    false;
  feeEvidenceSha256:
    string |
    null;
}

function publicKey(
  value:
    string,
  code:
    string,
): PublicKey {
  try {
    return new PublicKey(
      value,
    );
  } catch {
    throw new Error(
      code,
    );
  }
}

export function buildNativePwrcTransferPlan(
  input:
    NativePwrcTransferPlanInput,
): NativePwrcTransferPlan {
  if (
    input.amountBaseUnits <=
      0n ||
    input.amountBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_NATIVE_TRANSFER_AMOUNT_INVALID",
    );
  }

  const owner =
    publicKey(
      input.owner,
      "PWRC_NATIVE_TRANSFER_OWNER_INVALID",
    );
  const destinationOwner =
    publicKey(
      input.destinationOwner,
      "PWRC_NATIVE_TRANSFER_DESTINATION_INVALID",
    );
  const payer =
    publicKey(
      input.payer ??
        input.owner,
      "PWRC_NATIVE_TRANSFER_PAYER_INVALID",
    );
  const mint =
    new PublicKey(
      PWRC_CANONICAL_MINT,
    );
  const sourceAta =
    getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
  const destinationAta =
    getAssociatedTokenAddressSync(
      mint,
      destinationOwner,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

  if (
    sourceAta.equals(
      destinationAta,
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_TRANSFER_SELF_TRANSFER_FORBIDDEN",
    );
  }

  const preview =
    nativePwrcTransferPreview(
      input.amountBaseUnits,
    );
  const ensureDestinationAta =
    input.ensureDestinationAta ??
    true;
  const instructions:
    TransactionInstruction[] =
    [];

  if (
    ensureDestinationAta
  ) {
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        destinationAta,
        destinationOwner,
        mint,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  instructions.push(
    createTransferCheckedWithFeeInstruction(
      sourceAta,
      mint,
      destinationAta,
      owner,
      input.amountBaseUnits,
      PWRC_DECIMALS,
      preview
        .nativeTransferFeeBaseUnits,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  return {
    version:
      "1.0.0",
    mint:
      mint.toBase58(),
    tokenPolicySha256:
      PWRC_TOKEN_POLICY_EXPECTED_SHA256,
    tokenProgram:
      TOKEN_2022_PROGRAM_ID
        .toBase58(),
    owner:
      owner.toBase58(),
    destinationOwner:
      destinationOwner
        .toBase58(),
    payer:
      payer.toBase58(),
    sourceAta:
      sourceAta.toBase58(),
    destinationAta:
      destinationAta
        .toBase58(),
    grossBaseUnits:
      input.amountBaseUnits
        .toString(),
    nativeTransferFeeBaseUnits:
      preview
        .nativeTransferFeeBaseUnits
        .toString(),
    netBaseUnits:
      preview
        .netBaseUnits
        .toString(),
    decimals:
      9,
    ensureDestinationAta,
    instructionCount:
      instructions.length,
    instructions,
    requiresOwnerSignature:
      true,
    requiresPayerSignature:
      true,
    submissionIncluded:
      false,
    feeEvidenceSha256:
      input.feeEvidence
        ?.evidenceSha256 ??
      null,
  };
}


export interface VerifiedNativePwrcTransferPlanInput
  extends NativePwrcTransferPlanInput {
  feeEvidence:
    NativePwrcTransferFeeEpochEvidence;
  feeAuthorityPolicy:
    NativePwrcTransferFeeAuthorityPolicy;
  now:
    string;
  currentEpoch:
    bigint;
  currentSlot:
    bigint;
  maxFeeEvidenceAgeMs?:
    number;
  maxFeeEvidenceSlotLag?:
    bigint;
}

export function buildVerifiedNativePwrcTransferPlan(
  input:
    VerifiedNativePwrcTransferPlanInput,
): NativePwrcTransferPlan {
  assertNativePwrcTransferFeeEpochEvidenceFresh(
    input.feeEvidence,
    {
      now:
        input.now,
      currentEpoch:
        input.currentEpoch,
      currentSlot:
        input.currentSlot,
      maxAgeMs:
        input.maxFeeEvidenceAgeMs,
      maxSlotLag:
        input.maxFeeEvidenceSlotLag,
      authorityPolicy:
        input.feeAuthorityPolicy,
    },
  );

  return buildNativePwrcTransferPlan(
    input,
  );
}

export interface BuildUnsignedPwrcTransactionInput
  extends NativePwrcTransferPlanInput {
  recentBlockhash:
    string;
  computeUnitLimit?:
    number;
  computeUnitPriceMicroLamports?:
    number |
    bigint;
}

export function buildUnsignedNativePwrcTransferTransaction(
  input:
    BuildUnsignedPwrcTransactionInput,
): Transaction {
  const recentBlockhash =
    assertSolana32ByteBase58(
      input.recentBlockhash,
      "PWRC_NATIVE_TRANSFER_BLOCKHASH_INVALID",
    );

  const plan =
    buildNativePwrcTransferPlan(
      input,
    );
  const transaction =
    new Transaction();

  if (
    input.computeUnitLimit !==
      undefined
  ) {
    if (
      !Number.isSafeInteger(
        input.computeUnitLimit,
      ) ||
      input.computeUnitLimit <
        1 ||
      input.computeUnitLimit >
        PWRC_TX_COMPUTE_UNIT_LIMIT_MAX
    ) {
      throw new Error(
        "PWRC_NATIVE_TRANSFER_COMPUTE_LIMIT_INVALID",
      );
    }

    transaction.add(
      ComputeBudgetProgram
        .setComputeUnitLimit({
          units:
            input.computeUnitLimit,
        }),
    );
  }

  if (
    input.computeUnitPriceMicroLamports !==
      undefined
  ) {
    const price =
      BigInt(
        input
          .computeUnitPriceMicroLamports,
      );

    if (
      price <
        0n ||
      price >
        PWRC_TX_PRIORITY_FEE_MICROLAMPORTS_MAX
    ) {
      throw new Error(
        "PWRC_NATIVE_TRANSFER_PRIORITY_FEE_INVALID",
      );
    }

    if (
      price >
        0n &&
      input.computeUnitLimit ===
        undefined
    ) {
      throw new Error(
        "PWRC_NATIVE_TRANSFER_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT",
      );
    }

    if (
      input.computeUnitLimit !==
        undefined
    ) {
      const totalPriorityFeeLamports =
        (
          BigInt(
            input.computeUnitLimit,
          ) *
            price +
          999_999n
        ) /
        1_000_000n;

      if (
        totalPriorityFeeLamports >
          PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX
      ) {
        throw new Error(
          "PWRC_NATIVE_TRANSFER_TOTAL_PRIORITY_FEE_INVALID",
        );
      }
    }

    transaction.add(
      ComputeBudgetProgram
        .setComputeUnitPrice({
          microLamports:
            price,
        }),
    );
  }

  transaction.add(
    ...plan.instructions,
  );
  transaction.feePayer =
    new PublicKey(
      plan.payer,
    );
  transaction.recentBlockhash =
    recentBlockhash;

  return transaction;
}


export interface BuildVerifiedUnsignedPwrcTransactionInput
  extends BuildUnsignedPwrcTransactionInput {
  feeEvidence:
    NativePwrcTransferFeeEpochEvidence;
  feeAuthorityPolicy:
    NativePwrcTransferFeeAuthorityPolicy;
  now:
    string;
  currentEpoch:
    bigint;
  currentSlot:
    bigint;
  maxFeeEvidenceAgeMs?:
    number;
  maxFeeEvidenceSlotLag?:
    bigint;
}

export function buildVerifiedUnsignedNativePwrcTransferTransaction(
  input:
    BuildVerifiedUnsignedPwrcTransactionInput,
): Transaction {
  assertNativePwrcTransferFeeEpochEvidenceFresh(
    input.feeEvidence,
    {
      now:
        input.now,
      currentEpoch:
        input.currentEpoch,
      currentSlot:
        input.currentSlot,
      maxAgeMs:
        input.maxFeeEvidenceAgeMs,
      maxSlotLag:
        input.maxFeeEvidenceSlotLag,
      authorityPolicy:
        input.feeAuthorityPolicy,
    },
  );

  return buildUnsignedNativePwrcTransferTransaction(
    input,
  );
}

export function serializeUnsignedNativePwrcTransaction(
  transaction:
    Transaction,
): string {
  return transaction
    .serialize({
      requireAllSignatures:
        false,
      verifySignatures:
        false,
    })
    .toString(
      "base64",
    );
}


export function buildUnsignedNativePwrcTransactionFromIntent(
  intent:
    NativePwrcTransferIntent,
): Transaction {
  return buildUnsignedNativePwrcTransferTransaction({
    owner:
      intent.owner,
    destinationOwner:
      intent.destinationOwner,
    payer:
      intent.payer,
    amountBaseUnits:
      BigInt(
        intent.grossBaseUnits,
      ),
    recentBlockhash:
      intent.recentBlockhash,
    computeUnitLimit:
      intent.computeUnitLimit ??
      undefined,
    computeUnitPriceMicroLamports:
      intent.computeUnitPriceMicroLamports
        ? BigInt(
            intent.computeUnitPriceMicroLamports,
          )
        : undefined,
  });
}

export interface CreateNativePwrcTransferIntentInput
  extends Omit<
    NativePwrcTransferIntentInput,
    "payer"
  > {
  payer?:
    string;
}

export function createNativePwrcTransferIntentForTransaction(
  input:
    CreateNativePwrcTransferIntentInput,
): NativePwrcTransferIntent {
  return createNativePwrcTransferIntent({
    ...input,
    payer:
      input.payer ??
      input.owner,
  });
}

export interface NativePwrcTransactionReview {
  version:
    "1.0.0";
  valid:
    boolean;
  intentSha256:
    string;
  messageSha256:
    string;
  failures:
    readonly string[];
}

async function sha256Hex(
  bytes:
    Uint8Array,
): Promise<string> {
  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      bytes,
    );

  return Array.from(
    new Uint8Array(
      digest,
    ),
  )
    .map(
      (value) =>
        value
          .toString(
            16,
          )
          .padStart(
            2,
            "0",
          ),
    )
    .join("");
}

export async function reviewUnsignedNativePwrcTransaction(
  transaction:
    Transaction,
  intent:
    NativePwrcTransferIntent,
  now:
    string,
  currentBlockHeight?:
    bigint,
): Promise<
  NativePwrcTransactionReview
> {
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
        intent,
      );
    assertNativePwrcTransferIntentFresh(
      verifiedIntent,
      now,
      currentBlockHeight,
    );
  } catch (error) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_INTENT_VERIFICATION_FAILED",
    );
  }

  const actualMessage =
    transaction.serializeMessage();
  const actualHash =
    await sha256Hex(
      actualMessage,
    );

  if (
    verifiedIntent
  ) {
    const expected =
      buildUnsignedNativePwrcTransactionFromIntent(
        verifiedIntent,
      );
    const expectedMessage =
      expected.serializeMessage();

    const messagesEqual =
      actualMessage.length ===
        expectedMessage.length &&
      actualMessage.every(
        (
          value,
          index,
        ) =>
          value ===
          expectedMessage[
            index
          ],
      );

    if (
      !messagesEqual
    ) {
      failures.push(
        "PWRC_NATIVE_TRANSACTION_MESSAGE_MISMATCH",
      );
    }
  }

  if (
    verifiedIntent &&
    transaction.recentBlockhash !==
      verifiedIntent.recentBlockhash
  ) {
    failures.push(
      "PWRC_NATIVE_TRANSACTION_BLOCKHASH_MISMATCH",
    );
  }

  if (
    verifiedIntent &&
    transaction.feePayer
      ?.toBase58() !==
      verifiedIntent.payer
  ) {
    failures.push(
      "PWRC_NATIVE_TRANSACTION_FEE_PAYER_MISMATCH",
    );
  }

  return {
    version:
      "1.0.0",
    valid:
      failures.length ===
      0,
    intentSha256:
      intent.intentSha256,
    messageSha256:
      actualHash,
    failures,
  };
}
