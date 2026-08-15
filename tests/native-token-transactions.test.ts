import test from "node:test";
import assert from "node:assert/strict";
import {
  buildNativePwrcTransferPlan,
} from "../packages/sdk/src/native-token-transactions.js";
import {
  PWRC_CANONICAL_MINT,
} from "../packages/protocol/src/constants.js";

const owner =
  "11111111111111111111111111111111";
const destination =
  "Vote111111111111111111111111111111111111111";

test(
  "native PWRC transfer plan is Token-2022 fee aware",
  () => {
    const plan =
      buildNativePwrcTransferPlan({
        owner,
        destinationOwner:
          destination,
        amountBaseUnits:
          1_000n *
          1_000_000_000n,
      });

    assert.equal(
      plan.mint,
      PWRC_CANONICAL_MINT,
    );
    assert.equal(
      plan.tokenPolicySha256,
      "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4",
    );
    assert.equal(
      plan.grossBaseUnits,
      "1000000000000",
    );
    assert.equal(
      plan.nativeTransferFeeBaseUnits,
      "25000000000",
    );
    assert.equal(
      plan.netBaseUnits,
      "975000000000",
    );
    assert.equal(
      plan.submissionIncluded,
      false,
    );
  },
);

test(
  "native PWRC transfer uses idempotent destination ATA by default",
  () => {
    const plan =
      buildNativePwrcTransferPlan({
        owner,
        destinationOwner:
          destination,
        amountBaseUnits:
          1_000_000_000n,
      });

    assert.equal(
      plan.ensureDestinationAta,
      true,
    );
    assert.equal(
      plan.instructionCount,
      2,
    );
  },
);

test(
  "native PWRC transfer rejects self transfer",
  () => {
    assert.throws(
      () =>
        buildNativePwrcTransferPlan({
          owner,
          destinationOwner:
            owner,
          amountBaseUnits:
            1n,
        }),
      /PWRC_NATIVE_TRANSFER_SELF_TRANSFER_FORBIDDEN/,
    );
  },
);


test(
  "transaction builder enforces PowerChain compute and priority-fee ceilings",
  async () => {
    const {
      buildUnsignedNativePwrcTransferTransaction,
    } =
      await import(
        "../packages/sdk/src/native-token-transactions.js"
      );

    assert.throws(
      () =>
        buildUnsignedNativePwrcTransferTransaction({
          owner,
          destinationOwner:
            destination,
          amountBaseUnits:
            1_000_000_000n,
          recentBlockhash:
            "11111111111111111111111111111111",
          computeUnitLimit:
            400_001,
        }),
      /PWRC_NATIVE_TRANSFER_COMPUTE_LIMIT_INVALID/,
    );

    assert.throws(
      () =>
        buildUnsignedNativePwrcTransferTransaction({
          owner,
          destinationOwner:
            destination,
          amountBaseUnits:
            1_000_000_000n,
          recentBlockhash:
            "11111111111111111111111111111111",
          computeUnitPriceMicroLamports:
            1_000_001n,
        }),
      /PWRC_NATIVE_TRANSFER_PRIORITY_FEE_INVALID/,
    );
  },
);


test(
  "transaction builder rejects base58-looking non-32-byte blockhash",
  async () => {
    const {
      buildUnsignedNativePwrcTransferTransaction,
    } =
      await import(
        "../packages/sdk/src/native-token-transactions.js"
      );

    assert.throws(
      () =>
        buildUnsignedNativePwrcTransferTransaction({
          owner,
          destinationOwner:
            destination,
          amountBaseUnits:
            1_000_000_000n,
          recentBlockhash:
            "22222222222222222222222222222222",
        }),
      /PWRC_NATIVE_TRANSFER_BLOCKHASH_INVALID/,
    );
  },
);


test(
  "transaction priority fee requires explicit application compute limit",
  async () => {
    const {
      buildUnsignedNativePwrcTransferTransaction,
    } =
      await import(
        "../packages/sdk/src/native-token-transactions.js"
      );

    assert.throws(
      () =>
        buildUnsignedNativePwrcTransferTransaction({
          owner,
          destinationOwner:
            destination,
          amountBaseUnits:
            1_000_000_000n,
          recentBlockhash:
            "11111111111111111111111111111111",
          computeUnitPriceMicroLamports:
            1_000n,
        }),
      /PWRC_NATIVE_TRANSFER_PRIORITY_FEE_REQUIRES_COMPUTE_LIMIT/,
    );
  },
);
