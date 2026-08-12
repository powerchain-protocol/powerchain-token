import { Transaction } from "@mysten/sui/transactions";

export interface WpwrcBurnIntentDeployment {
  packageId: string;
  bridgeControllerId: string;
}

function assertDigest32(value: Uint8Array): void {
  if (value.length !== 32) {
    throw new Error("WPWRC_BURN_INTENT_HASH_LENGTH_INVALID");
  }
}

export function buildPauseWpwrcBridgeTransaction(input: {
  deployment: WpwrcBurnIntentDeployment;
  paused: boolean;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target:
      `${input.deployment.packageId}::bridge::set_paused`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.pure.bool(input.paused),
    ],
  });

  return tx;
}

/**
 * Builds a governance burn-intent transaction.
 *
 * The Move package must expose `stage_canonical_burn_intent`.
 * This transaction is submitted and finalized before the
 * canonical Solana BurnChecked transaction is allowed to run.
 */
export function buildStageCanonicalBurnIntentTransaction(
  input: {
    deployment: WpwrcBurnIntentDeployment;
    quarterId: bigint;
    expectedPostBurnWrappedCeilingBaseUnits: bigint;
    planSha256: Uint8Array;
  },
): Transaction {
  if (input.quarterId < 20271n) {
    throw new Error("WPWRC_BURN_INTENT_QUARTER_INVALID");
  }
  if (
    input.expectedPostBurnWrappedCeilingBaseUnits < 0n
  ) {
    throw new Error(
      "WPWRC_BURN_INTENT_CEILING_INVALID",
    );
  }
  assertDigest32(input.planSha256);

  const tx = new Transaction();

  tx.moveCall({
    target:
      `${input.deployment.packageId}::bridge::stage_canonical_burn_intent`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.pure.u64(input.quarterId),
      tx.pure.u64(
        input.expectedPostBurnWrappedCeilingBaseUnits,
      ),
      tx.pure.vector("u8", [...input.planSha256]),
    ],
  });

  return tx;
}

export function buildCancelCanonicalBurnIntentTransaction(
  input: {
    deployment: WpwrcBurnIntentDeployment;
  },
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target:
      `${input.deployment.packageId}::bridge::cancel_canonical_burn_intent`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
    ],
  });

  return tx;
}

export function buildLowerCanonicalSupplyCeilingTransaction(input: {
  deployment: WpwrcBurnIntentDeployment;
  quarterId: bigint;
  newCeilingBaseUnits: bigint;
  canonicalBurnEvidenceSha256: Uint8Array;
}): Transaction {
  if (input.quarterId < 20271n) {
    throw new Error("WPWRC_BURN_QUARTER_INVALID");
  }
  if (input.newCeilingBaseUnits < 0n) {
    throw new Error("WPWRC_BURN_CEILING_INVALID");
  }
  assertDigest32(input.canonicalBurnEvidenceSha256);

  const tx = new Transaction();
  tx.moveCall({
    target: `${input.deployment.packageId}::bridge::lower_canonical_supply_ceiling`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.pure.u64(input.quarterId),
      tx.pure.u64(input.newCeilingBaseUnits),
      tx.pure.vector("u8", [
        ...input.canonicalBurnEvidenceSha256,
      ]),
    ],
  });
  return tx;
}
