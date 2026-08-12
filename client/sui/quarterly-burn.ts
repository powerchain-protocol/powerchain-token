import { Transaction } from "@mysten/sui/transactions";

export function buildLowerCanonicalSupplyCeilingTransaction(input: {
  packageId: string;
  bridgeControllerId: string;
  quarterId: bigint;
  newCanonicalSupplyCeilingBaseUnits: bigint;
  canonicalBurnEvidenceHash: Uint8Array;
}): Transaction {
  if (input.quarterId <= 0n) {
    throw new Error("WPWRC_QUARTER_ID_INVALID");
  }
  if (input.newCanonicalSupplyCeilingBaseUnits <= 0n) {
    throw new Error("WPWRC_CANONICAL_CEILING_INVALID");
  }
  if (input.canonicalBurnEvidenceHash.length !== 32) {
    throw new Error("WPWRC_BURN_EVIDENCE_HASH_LENGTH_INVALID");
  }

  const tx = new Transaction();
  tx.moveCall({
    target:
      `${input.packageId}::bridge::lower_canonical_supply_ceiling`,
    arguments: [
      tx.object(input.bridgeControllerId),
      tx.pure.u64(input.quarterId),
      tx.pure.u64(input.newCanonicalSupplyCeilingBaseUnits),
      tx.pure.vector("u8", [...input.canonicalBurnEvidenceHash]),
    ],
  });

  return tx;
}
