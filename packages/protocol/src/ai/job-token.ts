import { createHmac, timingSafeEqual } from "node:crypto";
import { assertAiJob, type AiComputeJob } from "./policy.js";
import { canonicalJson } from "../canonical-json.js";

const DOMAIN = "powerchain:ai-compute-job:v1";

function payload(job: AiComputeJob): string {
  return `${DOMAIN}\n${canonicalJson(job)}`;
}

export function signAiJob(job: AiComputeJob, secret: string): string {
  assertAiJob(job);
  if (Buffer.byteLength(secret, "utf8") < 32) throw new Error("AI_JOB_SIGNING_SECRET_TOO_SHORT");
  return createHmac("sha256", secret).update(payload(job)).digest("hex");
}

export function verifyAiJob(
  job: AiComputeJob,
  signatureHex: string,
  secret: string,
): boolean {
  assertAiJob(job);
  if (!/^[a-f0-9]{64}$/i.test(signatureHex)) return false;
  const expected = Buffer.from(signAiJob(job, secret), "hex");
  const actual = Buffer.from(signatureHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
