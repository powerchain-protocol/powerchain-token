import { createHmac, timingSafeEqual } from "node:crypto";
import { assertAiJob } from "./policy.js";
import { canonicalJson } from "../canonical-json.js";
const DOMAIN = "powerchain:ai-compute-job:v1";
function payload(job) {
    return `${DOMAIN}\n${canonicalJson(job)}`;
}
export function signAiJob(job, secret) {
    assertAiJob(job);
    if (Buffer.byteLength(secret, "utf8") < 32)
        throw new Error("AI_JOB_SIGNING_SECRET_TOO_SHORT");
    return createHmac("sha256", secret).update(payload(job)).digest("hex");
}
export function verifyAiJob(job, signatureHex, secret) {
    assertAiJob(job);
    if (!/^[a-f0-9]{64}$/i.test(signatureHex))
        return false;
    const expected = Buffer.from(signAiJob(job, secret), "hex");
    const actual = Buffer.from(signatureHex, "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
//# sourceMappingURL=job-token.js.map