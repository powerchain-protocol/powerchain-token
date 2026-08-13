import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";
export function hashBurnJournalEntry(entry) {
    if (!/^[a-f0-9]{64}$/i.test(entry.detailsSha256)) {
        throw new Error("PWRC_BURN_JOURNAL_DETAILS_HASH_INVALID");
    }
    if (entry.previousEntrySha256 !== null &&
        !/^[a-f0-9]{64}$/i.test(entry.previousEntrySha256)) {
        throw new Error("PWRC_BURN_JOURNAL_PREVIOUS_HASH_INVALID");
    }
    return createHash("sha256")
        .update(canonicalJson(entry))
        .digest("hex");
}
export function verifyBurnJournalChain(entries) {
    let previous = null;
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
//# sourceMappingURL=journal.js.map