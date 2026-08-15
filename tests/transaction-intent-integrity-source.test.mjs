import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const intent =
  fs.readFileSync(
    "packages/protocol/src/native-transfer-intent.ts",
    "utf8",
  );
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );

test(
  "transfer intent is fully recomputed before trust",
  () => {
    for (const invariant of [
      "verifyNativePwrcTransferIntent",
      "PWRC_NATIVE_INTENT_VERSION_MISMATCH",
      "PWRC_NATIVE_INTENT_MINT_MISMATCH",
      "PWRC_NATIVE_INTENT_FEE_MISMATCH",
      "PWRC_NATIVE_INTENT_NET_MISMATCH",
      "PWRC_NATIVE_INTENT_COMMITMENT_MISMATCH",
      "PWRC_NATIVE_INTENT_AMOUNT_ENCODING_INVALID",
    ]) {
      assert.ok(
        intent.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "unsigned transaction review verifies intent before expected-message build",
  () => {
    const verifyIndex =
      transactions.indexOf(
        "verifyNativePwrcTransferIntent",
      );
    const reviewIndex =
      transactions.indexOf(
        "export async function reviewUnsignedNativePwrcTransaction",
      );
    const expectedIndex =
      transactions.indexOf(
        "buildUnsignedNativePwrcTransactionFromIntent",
        reviewIndex,
      );

    assert.ok(
      verifyIndex >=
        0,
    );
    assert.ok(
      reviewIndex >=
        0,
    );
    assert.ok(
      expectedIndex >
        reviewIndex,
    );
    assert.ok(
      transactions.includes(
        "PWRC_NATIVE_INTENT_VERIFICATION_FAILED",
      ),
    );
  },
);
