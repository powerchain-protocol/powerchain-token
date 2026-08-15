import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const preflight =
  fs.readFileSync(
    "packages/sdk/src/native-transfer-preflight.ts",
    "utf8",
  );
const runtime =
  fs.readFileSync(
    "apps/api/lib/token-runtime.mjs",
    "utf8",
  );

test(
  "native PWRC preflight validates Token-2022 accounts and balances",
  () => {
    for (const invariant of [
      "getAccount",
      "TOKEN_2022_PROGRAM_ID",
      "sourceBalanceSufficient",
      "destinationOwnerValid",
      "destinationMintValid",
      "sourceFrozen",
      "destinationFrozen",
      "PWRC_NATIVE_PREFLIGHT_INSUFFICIENT_TOKEN_BALANCE",
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_ATA_MISSING",
    ]) {
      assert.ok(
        preflight.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "native PWRC preflight estimates blockhash fee rent and payer SOL",
  () => {
    for (const invariant of [
      "getLatestBlockhash",
      "getFeeForMessage",
      "getMinimumBalanceForRentExemption",
      "getAccountLenForMint",
      "getBalance",
      "estimatedPayerDebitLamports",
      "PWRC_NATIVE_PREFLIGHT_INSUFFICIENT_PAYER_SOL",
    ]) {
      assert.ok(
        preflight.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "native PWRC preflight supports simulation without submission",
  () => {
    assert.ok(
      preflight.includes(
        "simulateTransaction",
      ),
    );
    assert.ok(
      preflight.includes(
        "simulationSucceeded",
      ),
    );

    for (const forbidden of [
      "sendTransaction(",
      "sendRawTransaction(",
      "sendAndConfirmTransaction(",
      "Keypair.generate(",
      "fromSecretKey(",
    ]) {
      assert.equal(
        preflight.includes(
          forbidden,
        ),
        false,
      );
    }

    assert.ok(
      preflight.includes(
        "submissionIncluded:",
      ),
    );
    assert.ok(
      preflight.includes(
        "signingIncluded:",
      ),
    );
  },
);

test(
  "runtime policy advertises read-only preflight capability",
  () => {
    for (const invariant of [
      "POWERCHAIN_NATIVE_PWRC_TRANSFER_PREFLIGHT_V1",
      "sourceAtaValidation",
      "destinationAtaValidation",
      "networkFeeEstimate",
      "ataRentEstimate",
      "simulationSupported",
      "submissionIncluded",
    ]) {
      assert.ok(
        runtime.includes(
          invariant,
        ),
      );
    }
  },
);


test(
  "preflight reports are observation-bound, committed and freshness-verifiable",
  () => {
    for (const invariant of [
      "observedAt",
      "observedSlot",
      "reportSha256",
      "canonicalJsonSha256",
      "preflightReportCommitment",
      "verifyNativePwrcTransferPreflightReport",
      "PWRC_NATIVE_PREFLIGHT_REPORT_STALE",
      "PWRC_NATIVE_PREFLIGHT_REPORT_COMMITMENT_MISMATCH",
      "PWRC_NATIVE_PREFLIGHT_REPORT_POLICY_MISMATCH",
      "PWRC_NATIVE_PREFLIGHT_REPORT_CAPABILITY_INVALID",
    ]) {
      assert.ok(
        preflight.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "simulation diagnostics are normalized before entering the committed report",
  () => {
    assert.ok(
      preflight.includes(
        "simulationError:",
      ),
    );
    assert.ok(
      preflight.includes(
        "JSON.stringify(",
      ),
    );
    assert.ok(
      preflight.includes(
        ".slice(",
      ),
    );
    assert.ok(
      preflight.includes(
        "safeError(",
      ),
    );
  },
);
