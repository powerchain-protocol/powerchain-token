import { PublicKey } from "@solana/web3.js";
import type { X402PaymentRequirement, X402Policy } from "./types.js";

export const PWRC_X402_POLICY: X402Policy = {
  version: "2",
  enabled: true,
  defaultAsset: "USDC",
  allowPwrcExperimental: false,
  requireFinalizedSettlement: true,
  requireUniquePaymentReference: true,
};

export function assertX402Requirement(
  requirement: X402PaymentRequirement,
  now: number = Math.floor(Date.now() / 1000),
): void {
  if (requirement.scheme !== "exact") throw new Error("X402_SCHEME_UNSUPPORTED");
  if (requirement.network !== "solana") throw new Error("X402_NETWORK_UNSUPPORTED");
  if (!/^\d+$/.test(requirement.amountBaseUnits)) throw new Error("X402_AMOUNT_INVALID");
  if (BigInt(requirement.amountBaseUnits) <= 0n) throw new Error("X402_AMOUNT_ZERO");
  new PublicKey(requirement.payTo);
  if (!requirement.resource.startsWith("https://")) throw new Error("X402_RESOURCE_MUST_USE_HTTPS");
  if (requirement.expiresAt <= now) throw new Error("X402_REQUIREMENT_EXPIRED");
  if (requirement.asset === "PWRC" && !PWRC_X402_POLICY.allowPwrcExperimental) {
    throw new Error("X402_PWRC_NOT_ENABLED");
  }
}
