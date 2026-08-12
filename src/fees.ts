import { createHash } from "node:crypto";
import { PWRC_MAX_BASE_UNITS } from "./constants.js";

export const PWRC_FEE_COLLECTOR_OWNER = "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy" as const;
export const PWRC_PROTOCOL_FEE_BPS = 250n;
export const PWRC_BPS_DENOMINATOR = 10_000n;
export const PWRC_MIN_FEE_BEARING_BASE_UNITS = 40n;
export const PWRC_TRANSFER_ID_DOMAIN = "powerchain:pwrc:fee-transfer:v1" as const;
export const PWRC_TRANSFER_REFERENCE_MAX_BYTES = 256 as const;

export interface PwrcFeeQuote {
  grossBaseUnits: bigint;
  feeBaseUnits: bigint;
  netBaseUnits: bigint;
  basisPoints: 250;
  percentage: "2.5%";
}

export function calculateProtocolFeeBaseUnits(amount: bigint): bigint {
  if (amount < PWRC_MIN_FEE_BEARING_BASE_UNITS) {
    throw new Error("PWRC_FEE_AMOUNT_BELOW_MINIMUM");
  }
  if (amount > PWRC_MAX_BASE_UNITS) {
    throw new Error("PWRC_FEE_AMOUNT_EXCEEDS_MAX");
  }
  const fee = (amount * PWRC_PROTOCOL_FEE_BPS) / PWRC_BPS_DENOMINATOR;
  if (fee <= 0n) throw new Error("PWRC_FEE_ZERO");
  return fee;
}

export function quoteProtocolFee(amount: bigint): PwrcFeeQuote {
  const feeBaseUnits = calculateProtocolFeeBaseUnits(amount);
  const netBaseUnits = amount - feeBaseUnits;
  if (netBaseUnits <= 0n) throw new Error("PWRC_FEE_NET_ZERO");
  return {
    grossBaseUnits: amount,
    feeBaseUnits,
    netBaseUnits,
    basisPoints: 250,
    percentage: "2.5%",
  };
}

export const splitProtocolFee = quoteProtocolFee;

/**
 * Stable business-operation id for idempotent on-chain fee transfers.
 * Use an immutable checkout/order/bridge operation id as `reference`.
 */
export function derivePwrcTransferId(reference: string): Uint8Array {
  const normalized = reference.trim();
  if (!normalized) throw new Error("PWRC_TRANSFER_REFERENCE_REQUIRED");
  if (Buffer.byteLength(normalized, "utf8") > PWRC_TRANSFER_REFERENCE_MAX_BYTES) {
    throw new Error("PWRC_TRANSFER_REFERENCE_TOO_LONG");
  }
  return createHash("sha256")
    .update(PWRC_TRANSFER_ID_DOMAIN)
    .update("\0")
    .update(normalized, "utf8")
    .digest();
}

export function transferIdHex(transferId: Uint8Array): string {
  if (transferId.length !== 32) throw new Error("PWRC_TRANSFER_ID_INVALID_LENGTH");
  return Buffer.from(transferId).toString("hex");
}
