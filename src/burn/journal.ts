import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";

export type BurnJournalStage =
  | "PLANNED"
  | "PRECHECKED"
  | "SOLANA_SIMULATED"
  | "SOLANA_SUBMITTED"
  | "SOLANA_FINALIZED"
  | "SUI_BRIDGE_PAUSED"
  | "SUI_CEILING_SUBMITTED"
  | "SUI_CEILING_FINALIZED"
  | "RECONCILED"
  | "COMPLETED"
  | "BLOCKED";

export interface BurnJournalEntry {
  version: "1.0.0";
  burnId: string;
  quarterId: string;
  stage: BurnJournalStage;
  timestamp: string;
  detailsSha256: string;
  previousEntrySha256: string | null;
}

export function hashBurnJournalEntry(entry: BurnJournalEntry): string {
  if (!/^[a-f0-9]{64}$/i.test(entry.detailsSha256)) {
    throw new Error("PWRC_BURN_JOURNAL_DETAILS_HASH_INVALID");
  }
  if (
    entry.previousEntrySha256 !== null &&
    !/^[a-f0-9]{64}$/i.test(entry.previousEntrySha256)
  ) {
    throw new Error("PWRC_BURN_JOURNAL_PREVIOUS_HASH_INVALID");
  }

  return createHash("sha256")
    .update(canonicalJson(entry))
    .digest("hex");
}

export function verifyBurnJournalChain(
  entries: readonly (BurnJournalEntry & { sha256: string })[],
): void {
  let previous: string | null = null;

  for (const entry of entries) {
    if (entry.previousEntrySha256 !== previous) {
      throw new Error("PWRC_BURN_JOURNAL_CHAIN_BROKEN");
    }

    const { sha256, ...body } = entry;
    const expected = hashBurnJournalEntry(body);
    if (sha256 !== expected) {
      throw new Error("PWRC_BURN_JOURNAL_ENTRY_HASH_MISMATCH");
    }

    previous = sha256;
  }
}
