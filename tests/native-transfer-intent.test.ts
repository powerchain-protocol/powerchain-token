import test from "node:test";
import assert from "node:assert/strict";
import {
  assertNativePwrcTransferIntentFresh,
  createNativePwrcTransferIntent,
  verifyNativePwrcTransferIntent,
} from "../packages/protocol/src/native-transfer-intent.js";

const base = {
  owner:
    "11111111111111111111111111111111",
  destinationOwner:
    "Vote111111111111111111111111111111111111111",
  payer:
    "11111111111111111111111111111111",
  amountBaseUnits:
    1_000_000_000n,
  recentBlockhash:
    "11111111111111111111111111111111",
  lastValidBlockHeight:
    1_000n,
  computeUnitLimit:
    200_000,
  computeUnitPriceMicroLamports:
    1_000n,
  createdAt:
    "2026-08-15T00:00:00.000Z",
  expiresAt:
    "2026-08-15T00:01:00.000Z",
};

test(
  "native PWRC transfer intent is deterministic",
  () => {
    const first =
      createNativePwrcTransferIntent(
        base,
      );
    const second =
      createNativePwrcTransferIntent(
        base,
      );

    assert.equal(
      first.intentSha256,
      second.intentSha256,
    );
    assert.match(
      first.intentSha256,
      /^[a-f0-9]{64}$/,
    );
  },
);

test(
  "native PWRC intent binds fee and net amount",
  () => {
    const intent =
      createNativePwrcTransferIntent(
        base,
      );

    assert.equal(
      intent.grossBaseUnits,
      "1000000000",
    );
    assert.equal(
      intent.nativeTransferFeeBaseUnits,
      "25000000",
    );
    assert.equal(
      intent.netBaseUnits,
      "975000000",
    );
  },
);

test(
  "intent freshness rejects expired time and block height",
  () => {
    const intent =
      createNativePwrcTransferIntent(
        base,
      );

    assert.throws(
      () =>
        assertNativePwrcTransferIntentFresh(
          intent,
          "2026-08-15T00:02:00.000Z",
        ),
      /PWRC_NATIVE_INTENT_EXPIRED/,
    );

    assert.throws(
      () =>
        assertNativePwrcTransferIntentFresh(
          intent,
          "2026-08-15T00:00:30.000Z",
          1_001n,
        ),
      /PWRC_NATIVE_INTENT_BLOCKHASH_EXPIRED/,
    );
  },
);


test(
  "transfer intent rejects base58 strings that are not 32-byte Solana keys",
  () => {
    assert.throws(
      () =>
        createNativePwrcTransferIntent({
          ...base,
          owner:
            "22222222222222222222222222222222",
        }),
      /PWRC_NATIVE_INTENT_OWNER_INVALID/,
    );
  },
);


test(
  "intent verifier rejects mutated canonical fields and stale commitments",
  () => {
    const intent =
      createNativePwrcTransferIntent(
        base,
      );

    for (const [
      mutation,
      code,
    ] of [
      [
        {
          ...intent,
          mint:
            "11111111111111111111111111111111",
        },
        /PWRC_NATIVE_INTENT_MINT_MISMATCH/,
      ],
      [
        {
          ...intent,
          nativeTransferFeeBaseUnits:
            "1",
        },
        /PWRC_NATIVE_INTENT_FEE_MISMATCH/,
      ],
      [
        {
          ...intent,
          netBaseUnits:
            "1",
        },
        /PWRC_NATIVE_INTENT_NET_MISMATCH/,
      ],
      [
        {
          ...intent,
          intentSha256:
            "0".repeat(
              64,
            ),
        },
        /PWRC_NATIVE_INTENT_COMMITMENT_MISMATCH/,
      ],
    ] as const) {
      assert.throws(
        () =>
          verifyNativePwrcTransferIntent(
            mutation,
          ),
        code,
      );
    }
  },
);

test(
  "intent verifier rejects non-canonical integer encodings",
  () => {
    const intent =
      createNativePwrcTransferIntent(
        base,
      );

    assert.throws(
      () =>
        verifyNativePwrcTransferIntent({
          ...intent,
          grossBaseUnits:
            "01000000000",
        }),
      /PWRC_NATIVE_INTENT_AMOUNT_ENCODING_INVALID/,
    );
  },
);


test(
  "native transfer intent binds the canonical token policy commitment",
  () => {
    const intent =
      createNativePwrcTransferIntent(
        base,
      );

    assert.equal(
      intent.tokenPolicySha256,
      "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4",
    );

    assert.throws(
      () =>
        verifyNativePwrcTransferIntent({
          ...intent,
          tokenPolicySha256:
            "0".repeat(64),
        }),
      /PWRC_NATIVE_INTENT_TOKEN_POLICY_MISMATCH/,
    );
  },
);

test(
  "native transfer intent requires explicit compute limit for non-zero priority fee",
  () => {
    assert.throws(
      () =>
        createNativePwrcTransferIntent({
          ...base,
          computeUnitLimit:
            undefined,
          computeUnitPriceMicroLamports:
            1_000n,
        }),
      /PWRC_NATIVE_INTENT_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT/,
    );
  },
);
