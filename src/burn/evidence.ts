import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";

export interface FinalizedQuarterlyBurnEvidence {
  version: "1.0.0";
  burnId: string;
  planSha256: string;
  solanaTransactionSignature: string;
  finalizedSlot: string;
  preBurnCanonicalSupplyBaseUnits: string;
  burnedBaseUnits: string;
  postBurnCanonicalSupplyBaseUnits: string;
  suiCanonicalSupplyCeilingBaseUnits: string;
  suiCeilingUpdateTransactionDigest: string;
  suiCheckpoint: string;
  observedAt: string;
}

export function finalizedQuarterlyBurnEvidenceSha256(
  evidence: FinalizedQuarterlyBurnEvidence,
): string {
  if (
    evidence.postBurnCanonicalSupplyBaseUnits !==
    evidence.suiCanonicalSupplyCeilingBaseUnits
  ) {
    throw new Error("PWRC_SUI_CANONICAL_CEILING_NOT_SYNCHRONIZED");
  }

  return createHash("sha256")
    .update(canonicalJson(evidence))
    .digest("hex");
}
