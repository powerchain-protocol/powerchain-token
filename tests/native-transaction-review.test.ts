import test from "node:test";
import assert from "node:assert/strict";
import {
  buildUnsignedNativePwrcTransactionFromIntent,
  createNativePwrcTransferIntentForTransaction,
  reviewUnsignedNativePwrcTransaction,
} from "../packages/sdk/src/native-token-transactions.js";

test(
  "exact unsigned transaction matches committed intent",
  async () => {
    const intent =
      createNativePwrcTransferIntentForTransaction({
        owner:
          "11111111111111111111111111111111",
        destinationOwner:
          "Vote111111111111111111111111111111111111111",
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
      });
    const transaction =
      buildUnsignedNativePwrcTransactionFromIntent(
        intent,
      );
    const review =
      await reviewUnsignedNativePwrcTransaction(
        transaction,
        intent,
        "2026-08-15T00:00:30.000Z",
        900n,
      );

    assert.equal(
      review.valid,
      true,
    );
    assert.deepEqual(
      review.failures,
      [],
    );
  },
);

test(
  "unexpected transaction mutation fails review",
  async () => {
    const intent =
      createNativePwrcTransferIntentForTransaction({
        owner:
          "11111111111111111111111111111111",
        destinationOwner:
          "Vote111111111111111111111111111111111111111",
        amountBaseUnits:
          1_000_000_000n,
        recentBlockhash:
          "11111111111111111111111111111111",
        lastValidBlockHeight:
          1_000n,
        createdAt:
          "2026-08-15T00:00:00.000Z",
        expiresAt:
          "2026-08-15T00:01:00.000Z",
      });
    const transaction =
      buildUnsignedNativePwrcTransactionFromIntent(
        intent,
      );

    transaction.recentBlockhash =
      "Vote111111111111111111111111111111111111111";

    const review =
      await reviewUnsignedNativePwrcTransaction(
        transaction,
        intent,
        "2026-08-15T00:00:30.000Z",
        900n,
      );

    assert.equal(
      review.valid,
      false,
    );
    assert.ok(
      review.failures.includes(
        "PWRC_NATIVE_TRANSACTION_MESSAGE_MISMATCH",
      ),
    );
    assert.ok(
      review.failures.includes(
        "PWRC_NATIVE_TRANSACTION_BLOCKHASH_MISMATCH",
      ),
    );
  },
);
