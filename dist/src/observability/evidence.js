import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";
export function createEvidenceEnvelope(input) {
    if (!input.type || !input.subject)
        throw new Error("EVIDENCE_IDENTITY_REQUIRED");
    if (!Number.isInteger(input.observedAt) || input.observedAt <= 0) {
        throw new Error("EVIDENCE_TIME_INVALID");
    }
    const unsigned = {
        version: "1.0.0",
        type: input.type,
        observedAt: input.observedAt,
        subject: input.subject,
        payload: input.payload,
        ...(input.previousSha256
            ? { previousSha256: input.previousSha256 }
            : {}),
    };
    const sha256 = createHash("sha256")
        .update(canonicalJson(unsigned))
        .digest("hex");
    return { ...unsigned, sha256 };
}
export function verifyEvidenceEnvelope(evidence) {
    const { sha256, ...unsigned } = evidence;
    if (!/^[a-f0-9]{64}$/i.test(sha256))
        throw new Error("EVIDENCE_HASH_INVALID");
    const expected = createHash("sha256")
        .update(canonicalJson(unsigned))
        .digest("hex");
    if (expected !== sha256)
        throw new Error("EVIDENCE_HASH_MISMATCH");
}
//# sourceMappingURL=evidence.js.map