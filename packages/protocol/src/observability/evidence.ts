import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";

export interface EvidenceEnvelope<T> {
  version: "1.0.0";
  type: string;
  observedAt: number;
  subject: string;
  payload: T;
  previousSha256?: string;
  sha256: string;
}

export function createEvidenceEnvelope<T>(input: {
  type: string;
  observedAt: number;
  subject: string;
  payload: T;
  previousSha256?: string;
}): EvidenceEnvelope<T> {
  if (!input.type || !input.subject) throw new Error("EVIDENCE_IDENTITY_REQUIRED");
  if (!Number.isInteger(input.observedAt) || input.observedAt <= 0) {
    throw new Error("EVIDENCE_TIME_INVALID");
  }

  const unsigned = {
    version: "1.0.0" as const,
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

export function verifyEvidenceEnvelope<T>(evidence: EvidenceEnvelope<T>): void {
  const { sha256, ...unsigned } = evidence;
  if (!/^[a-f0-9]{64}$/i.test(sha256)) throw new Error("EVIDENCE_HASH_INVALID");

  const expected = createHash("sha256")
    .update(canonicalJson(unsigned))
    .digest("hex");

  if (expected !== sha256) throw new Error("EVIDENCE_HASH_MISMATCH");
}
