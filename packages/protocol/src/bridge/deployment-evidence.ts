import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";

export interface BridgeDeploymentEvidence {
  version: "1.0.0";
  network: "testnet" | "mainnet";
  sourceCommitSha256: string;
  sourceProgramId: string;
  sourceVault: string;
  suiPackageId: string;
  suiBridgeControllerId: string;
  suiCurrencyObjectId: string;
  suiCoinType: string;
  canonicalDecimals: 9;
  wrappedDecimals: 9;
  canonicalBaseUnitsPerWrappedBaseUnit: "1";
  canonicalMint: string;
  operator: string;
  governor: string;
  generatedAt: string;
}

export function assertBridgeDeploymentEvidence(
  evidence: BridgeDeploymentEvidence,
): void {
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
  if (
    evidence.canonicalBaseUnitsPerWrappedBaseUnit !== "1"
  ) {
    throw new Error("PWRC_DEPLOYMENT_CONVERSION_INVALID");
  }
}

export function bridgeDeploymentEvidenceSha256(
  evidence: BridgeDeploymentEvidence,
): string {
  assertBridgeDeploymentEvidence(evidence);
  return createHash("sha256")
    .update(canonicalJson(evidence))
    .digest("hex");
}
