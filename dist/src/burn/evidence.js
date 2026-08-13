import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";
export function finalizedQuarterlyBurnEvidenceSha256(evidence) {
    if (evidence.postBurnCanonicalSupplyBaseUnits !==
        evidence.suiCanonicalSupplyCeilingBaseUnits) {
        throw new Error("PWRC_SUI_CANONICAL_CEILING_NOT_SYNCHRONIZED");
    }
    return createHash("sha256")
        .update(canonicalJson(evidence))
        .digest("hex");
}
//# sourceMappingURL=evidence.js.map