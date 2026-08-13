import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";
export function assertBridgeDeploymentEvidence(evidence) {
    for (const hash of [evidence.sourceCommitSha256]) {
        if (!/^[a-f0-9]{64}$/i.test(hash)) {
            throw new Error("PWRC_DEPLOYMENT_SOURCE_COMMIT_INVALID");
        }
    }
    for (const suiAddress of [
        evidence.suiPackageId,
        evidence.suiBridgeControllerId,
        evidence.suiCurrencyObjectId,
    ]) {
        if (!/^0x[a-f0-9]{64}$/i.test(suiAddress)) {
            throw new Error("PWRC_DEPLOYMENT_SUI_OBJECT_INVALID");
        }
    }
    if (evidence.canonicalDecimals !== 9) {
        throw new Error("PWRC_DEPLOYMENT_CANONICAL_DECIMALS_INVALID");
    }
    if (evidence.wrappedDecimals !== 9) {
        throw new Error("PWRC_DEPLOYMENT_WRAPPED_DECIMALS_INVALID");
    }
    if (evidence.canonicalBaseUnitsPerWrappedBaseUnit !== "1") {
        throw new Error("PWRC_DEPLOYMENT_CONVERSION_INVALID");
    }
}
export function bridgeDeploymentEvidenceSha256(evidence) {
    assertBridgeDeploymentEvidence(evidence);
    return createHash("sha256")
        .update(canonicalJson(evidence))
        .digest("hex");
}
//# sourceMappingURL=deployment-evidence.js.map