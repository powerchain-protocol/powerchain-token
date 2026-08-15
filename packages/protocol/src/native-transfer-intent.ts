import {
  PWRC_CANONICAL_MINT,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_TX_COMPUTE_UNIT_LIMIT_MAX,
  PWRC_TX_PRIORITY_FEE_MICROLAMPORTS_MAX,
  PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX,
} from "./constants.js";
import {
  nativePwrcTransferPreview,
} from "./native-token.js";
import {
  PWRC_TOKEN_POLICY_EXPECTED_SHA256,
} from "./token-policy.js";
import {
  assertSolana32ByteBase58,
  canonicalJsonSha256,
} from "./helpers.js";

export interface NativePwrcTransferIntentInput {
  owner:
    string;
  destinationOwner:
    string;
  payer:
    string;
  amountBaseUnits:
    bigint;
  recentBlockhash:
    string;
  lastValidBlockHeight:
    bigint;
  computeUnitLimit?:
    number;
  computeUnitPriceMicroLamports?:
    bigint;
  createdAt:
    string;
  expiresAt:
    string;
}

export interface NativePwrcTransferIntent {
  version:
    "1.0.0";
  mint:
    string;
  tokenPolicySha256:
    string;
  owner:
    string;
  destinationOwner:
    string;
  payer:
    string;
  grossBaseUnits:
    string;
  nativeTransferFeeBaseUnits:
    string;
  netBaseUnits:
    string;
  recentBlockhash:
    string;
  lastValidBlockHeight:
    string;
  computeUnitLimit:
    number |
    null;
  computeUnitPriceMicroLamports:
    string |
    null;
  createdAt:
    string;
  expiresAt:
    string;
  intentSha256:
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


function parseCanonicalUnsignedBigInt(
  value:
    string,
  code:
    string,
): bigint {
  if (
    !/^(0|[1-9][0-9]*)$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }

  return BigInt(
    value,
  );
}

function pushMismatch(
  actual:
    unknown,
  expected:
    unknown,
  code:
    string,
): void {
  if (
    actual !==
      expected
  ) {
    throw new Error(
      code,
    );
  }
}

export function createNativePwrcTransferIntent(
  input:
    NativePwrcTransferIntentInput,
): NativePwrcTransferIntent {
  const owner =
    assertSolana32ByteBase58(
      input.owner,
      "PWRC_NATIVE_INTENT_OWNER_INVALID",
    );
  const destinationOwner =
    assertSolana32ByteBase58(
      input.destinationOwner,
      "PWRC_NATIVE_INTENT_DESTINATION_INVALID",
    );
  const payer =
    assertSolana32ByteBase58(
      input.payer,
      "PWRC_NATIVE_INTENT_PAYER_INVALID",
    );
  const recentBlockhash =
    assertSolana32ByteBase58(
      input.recentBlockhash,
      "PWRC_NATIVE_INTENT_BLOCKHASH_INVALID",
    );

  if (
    owner ===
      destinationOwner
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_SELF_TRANSFER_FORBIDDEN",
    );
  }

  if (
    input.amountBaseUnits <=
      0n ||
    input.amountBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_AMOUNT_INVALID",
    );
  }

  if (
    input.lastValidBlockHeight <=
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_BLOCK_HEIGHT_INVALID",
    );
  }

  if (
    input.computeUnitLimit !==
      undefined &&
    (
      !Number.isSafeInteger(
        input.computeUnitLimit,
      ) ||
      input.computeUnitLimit <
        1 ||
      input.computeUnitLimit >
        PWRC_TX_COMPUTE_UNIT_LIMIT_MAX
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_COMPUTE_LIMIT_INVALID",
    );
  }

  if (
    input.computeUnitPriceMicroLamports !==
      undefined &&
    (
      input.computeUnitPriceMicroLamports <
        0n ||
      input.computeUnitPriceMicroLamports >
        PWRC_TX_PRIORITY_FEE_MICROLAMPORTS_MAX
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_PRIORITY_FEE_INVALID",
    );
  }

  if (
    input.computeUnitPriceMicroLamports !==
      undefined &&
    input.computeUnitPriceMicroLamports >
      0n &&
    input.computeUnitLimit ===
      undefined
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT",
    );
  }

  if (
    input.computeUnitPriceMicroLamports !==
      undefined &&
    input.computeUnitLimit !==
      undefined
  ) {
    const totalPriorityFeeLamports =
      (
        BigInt(
          input.computeUnitLimit,
        ) *
          input.computeUnitPriceMicroLamports +
        999_999n
      ) /
      1_000_000n;

    if (
      totalPriorityFeeLamports >
        PWRC_TX_PRIORITY_FEE_LAMPORTS_MAX
    ) {
      throw new Error(
        "PWRC_NATIVE_INTENT_TOTAL_PRIORITY_FEE_INVALID",
      );
    }
  }

  const createdAtMs =
    assertIso(
      input.createdAt,
      "PWRC_NATIVE_INTENT_CREATED_AT_INVALID",
    );
  const expiresAtMs =
    assertIso(
      input.expiresAt,
      "PWRC_NATIVE_INTENT_EXPIRES_AT_INVALID",
    );

  if (
    expiresAtMs <=
      createdAtMs ||
    expiresAtMs -
      createdAtMs >
      5 * 60_000
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_EXPIRY_INVALID",
    );
  }

  const preview =
    nativePwrcTransferPreview(
      input.amountBaseUnits,
    );

  const payload = {
    version:
      "1.0.0" as const,
    mint:
      PWRC_CANONICAL_MINT,
    tokenPolicySha256:
      PWRC_TOKEN_POLICY_EXPECTED_SHA256,
    owner,
    destinationOwner,
    payer,
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
    recentBlockhash,
    lastValidBlockHeight:
      input.lastValidBlockHeight
        .toString(),
    computeUnitLimit:
      input.computeUnitLimit ??
      null,
    computeUnitPriceMicroLamports:
      input.computeUnitPriceMicroLamports
        ?.toString() ??
      null,
    createdAt:
      input.createdAt,
    expiresAt:
      input.expiresAt,
  };

  return {
    ...payload,
    intentSha256:
      canonicalJsonSha256({
        domain:
          "POWERCHAIN_NATIVE_PWRC_TRANSFER_INTENT_V1",
        intent:
          payload,
      }),
  };
}


export function verifyNativePwrcTransferIntent(
  intent:
    NativePwrcTransferIntent,
): NativePwrcTransferIntent {
  if (
    intent.version !==
      "1.0.0"
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_VERSION_MISMATCH",
    );
  }

  if (
    intent.mint !==
      PWRC_CANONICAL_MINT
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_MINT_MISMATCH",
    );
  }

  if (
    intent.tokenPolicySha256 !==
      PWRC_TOKEN_POLICY_EXPECTED_SHA256
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_TOKEN_POLICY_MISMATCH",
    );
  }

  const grossBaseUnits =
    parseCanonicalUnsignedBigInt(
      intent.grossBaseUnits,
      "PWRC_NATIVE_INTENT_AMOUNT_ENCODING_INVALID",
    );
  const nativeTransferFeeBaseUnits =
    parseCanonicalUnsignedBigInt(
      intent.nativeTransferFeeBaseUnits,
      "PWRC_NATIVE_INTENT_FEE_ENCODING_INVALID",
    );
  const netBaseUnits =
    parseCanonicalUnsignedBigInt(
      intent.netBaseUnits,
      "PWRC_NATIVE_INTENT_NET_ENCODING_INVALID",
    );
  const lastValidBlockHeight =
    parseCanonicalUnsignedBigInt(
      intent.lastValidBlockHeight,
      "PWRC_NATIVE_INTENT_BLOCK_HEIGHT_INVALID",
    );
  const computeUnitPriceMicroLamports =
    intent.computeUnitPriceMicroLamports ===
      null
      ? undefined
      : parseCanonicalUnsignedBigInt(
          intent.computeUnitPriceMicroLamports,
          "PWRC_NATIVE_INTENT_PRIORITY_FEE_INVALID",
        );

  const rebuilt =
    createNativePwrcTransferIntent({
      owner:
        intent.owner,
      destinationOwner:
        intent.destinationOwner,
      payer:
        intent.payer,
      amountBaseUnits:
        grossBaseUnits,
      recentBlockhash:
        intent.recentBlockhash,
      lastValidBlockHeight,
      computeUnitLimit:
        intent.computeUnitLimit ??
        undefined,
      computeUnitPriceMicroLamports,
      createdAt:
        intent.createdAt,
      expiresAt:
        intent.expiresAt,
    });

  pushMismatch(
    intent.tokenPolicySha256,
    rebuilt.tokenPolicySha256,
    "PWRC_NATIVE_INTENT_TOKEN_POLICY_MISMATCH",
  );
  pushMismatch(
    intent.nativeTransferFeeBaseUnits,
    rebuilt.nativeTransferFeeBaseUnits,
    "PWRC_NATIVE_INTENT_FEE_MISMATCH",
  );
  pushMismatch(
    nativeTransferFeeBaseUnits.toString(),
    rebuilt.nativeTransferFeeBaseUnits,
    "PWRC_NATIVE_INTENT_FEE_MISMATCH",
  );
  pushMismatch(
    intent.netBaseUnits,
    rebuilt.netBaseUnits,
    "PWRC_NATIVE_INTENT_NET_MISMATCH",
  );
  pushMismatch(
    netBaseUnits.toString(),
    rebuilt.netBaseUnits,
    "PWRC_NATIVE_INTENT_NET_MISMATCH",
  );
  pushMismatch(
    intent.owner,
    rebuilt.owner,
    "PWRC_NATIVE_INTENT_OWNER_INVALID",
  );
  pushMismatch(
    intent.destinationOwner,
    rebuilt.destinationOwner,
    "PWRC_NATIVE_INTENT_DESTINATION_INVALID",
  );
  pushMismatch(
    intent.payer,
    rebuilt.payer,
    "PWRC_NATIVE_INTENT_PAYER_INVALID",
  );
  pushMismatch(
    intent.recentBlockhash,
    rebuilt.recentBlockhash,
    "PWRC_NATIVE_INTENT_BLOCKHASH_INVALID",
  );
  pushMismatch(
    intent.lastValidBlockHeight,
    rebuilt.lastValidBlockHeight,
    "PWRC_NATIVE_INTENT_BLOCK_HEIGHT_INVALID",
  );
  pushMismatch(
    intent.computeUnitLimit,
    rebuilt.computeUnitLimit,
    "PWRC_NATIVE_INTENT_COMPUTE_LIMIT_INVALID",
  );
  pushMismatch(
    intent.computeUnitPriceMicroLamports,
    rebuilt.computeUnitPriceMicroLamports,
    "PWRC_NATIVE_INTENT_PRIORITY_FEE_INVALID",
  );
  pushMismatch(
    intent.createdAt,
    rebuilt.createdAt,
    "PWRC_NATIVE_INTENT_CREATED_AT_INVALID",
  );
  pushMismatch(
    intent.expiresAt,
    rebuilt.expiresAt,
    "PWRC_NATIVE_INTENT_EXPIRES_AT_INVALID",
  );

  if (
    !/^[a-f0-9]{64}$/.test(
      intent.intentSha256,
    ) ||
    intent.intentSha256 !==
      rebuilt.intentSha256
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_COMMITMENT_MISMATCH",
    );
  }

  return rebuilt;
}

export function assertNativePwrcTransferIntentFresh(
  intent:
    NativePwrcTransferIntent,
  now:
    string,
  currentBlockHeight?:
    bigint,
): void {
  verifyNativePwrcTransferIntent(
    intent,
  );

  const nowMs =
    assertIso(
      now,
      "PWRC_NATIVE_INTENT_NOW_INVALID",
    );
  const expiresAtMs =
    assertIso(
      intent.expiresAt,
      "PWRC_NATIVE_INTENT_EXPIRES_AT_INVALID",
    );

  if (
    nowMs >
      expiresAtMs
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_EXPIRED",
    );
  }

  if (
    currentBlockHeight !==
      undefined &&
    currentBlockHeight >
      BigInt(
        intent.lastValidBlockHeight,
      )
  ) {
    throw new Error(
      "PWRC_NATIVE_INTENT_BLOCKHASH_EXPIRED",
    );
  }
}
