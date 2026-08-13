import { createHash } from "node:crypto";
import { canonicalJson } from "../../src/canonical-json.js";
export function hashSuiBurnReleaseEvidence(evidence) {
    if (!/^[a-f0-9]{64}$/i.test(evidence.burnReferenceHex)) {
        throw new Error("WPWRC_RELEASE_BURN_REFERENCE_INVALID");
    }
    if (!/^\d+$/.test(evidence.amountWrappedBaseUnits)) {
        throw new Error("WPWRC_RELEASE_AMOUNT_INVALID");
    }
    return createHash("sha256")
        .update("POWERCHAIN_WPWRC_SUI_TO_SOLANA_RELEASE_V1\0")
        .update(canonicalJson(evidence))
        .digest("hex");
}
//# sourceMappingURL=release-evidence.js.map