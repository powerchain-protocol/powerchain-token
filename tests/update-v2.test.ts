import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBurnSafeToUnpause,
} from "../packages/protocol/src/burn/unpause.js";
import {
  quarterlyBurnExecutionRecordSha256,
} from "../packages/protocol/src/burn/record.js";
import {
  assertBridgeDeploymentManifest,
} from "../packages/protocol/src/bridge/manifest.js";

test("unpause requires reconciled burn evidence", () => {
  assert.throws(
    () =>
      assertBurnSafeToUnpause({
        version: "1.0.0",
        quarterId: "20271",
        solanaFinalized: true,
        canonicalSupplyMatchesPlan: true,
        suiCeilingFinalized: true,
        suiCeilingMatchesCanonicalSupply: true,
        bridgeConservationValid: false,
        pendingBurnIntentCleared: true,
        executionRecordState:
          "RECONCILED",
      }),
    /PWRC_UNPAUSE_CONSERVATION_INVALID/,
  );
});

test("burn record hash is deterministic", () => {
  const record = {
    version: "1.0.0" as const,
    burnId:
      "pwrc:quarterly-burn:2027:q1",
    quarterId: "20271",
    state:
      "INTENT_STAGED" as const,
    planSha256:
      "ab".repeat(32),
    intentSha256:
      "cd".repeat(32),
    preBurnCanonicalSupplyBaseUnits:
      "1000000",
    targetBurnCanonicalBaseUnits:
      "20000",
    expectedPostBurnCanonicalSupplyBaseUnits:
      "980000",
    expectedPostBurnWrappedCeilingBaseUnits:
      "980000",
    suiIntentDigest: "digest",
  };

  assert.equal(
    quarterlyBurnExecutionRecordSha256(
      record,
    ),
    quarterlyBurnExecutionRecordSha256({
      ...record,
    }),
  );
});

test("bridge manifest rejects Solana System Program", () => {
  assert.throws(
    () =>
      assertBridgeDeploymentManifest({
        version: "1.0.0",
        network: "mainnet",
        canonicalMint:
          "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
        solanaBridgeProgramId:
          "11111111111111111111111111111111",
        solanaVault: "vault",
        suiPackageId:
          "0x" + "1".repeat(64),
        suiBridgeControllerId:
          "0x" + "2".repeat(64),
        suiCurrencyObjectId:
          "0x" + "3".repeat(64),
        suiCoinType:
          "0x" +
          "1".repeat(64) +
          "::wpwrc::WPWRC",
        canonicalDecimals: 9,
        wrappedDecimals: 9,
        baseUnitFactor: "1",
        transferFeeBasisPoints: 250,
        maximumTransferFeeTokens:
          "1000000",
        wrappedGenesisSupplyBaseUnits:
          "0",
        wrappedMintPolicy:
          "bridge-only",
      }),
    /PWRC_SYSTEM_PROGRAM_IS_NOT_DEPLOYMENT/,
  );
});
