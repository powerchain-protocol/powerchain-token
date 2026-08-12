import { createHash } from "node:crypto";
import { canonicalJson } from "../../src/canonical-json.js";

export interface PwrcSolanaLockEventIdentity {
  version: "1.0.0";
  cluster: "devnet" | "mainnet-beta";
  lockProgramId: string;
  bridgeConfig: string;
  lockReceipt: string;
  canonicalMint: string;
  vault: string;
  transactionSignature: string;
  instructionIndex: number;
  slot: string;
  transferIdHex: string;
  amountBaseUnits: string;
  suiRecipient: string;
}

export function pwrcSolanaLockClaimHash(
  input: PwrcSolanaLockEventIdentity,
): string {
  if (input.version !== "1.0.0") {
    throw new Error("PWRC_LOCK_CLAIM_VERSION_INVALID");
  }
  if (!/^\d+$/.test(input.slot)) {
    throw new Error("PWRC_LOCK_CLAIM_SLOT_INVALID");
  }
  if (
    !/^\d+$/.test(input.amountBaseUnits) ||
    BigInt(input.amountBaseUnits) <= 0n
  ) {
    throw new Error("PWRC_LOCK_CLAIM_AMOUNT_INVALID");
  }
  if (!/^[a-f0-9]{64}$/i.test(input.transferIdHex)) {
    throw new Error("PWRC_LOCK_TRANSFER_ID_INVALID");
  }
  if (!/^0x[a-f0-9]{64}$/i.test(input.suiRecipient)) {
    throw new Error("PWRC_LOCK_SUI_RECIPIENT_INVALID");
  }

  return createHash("sha256")
    .update("POWERCHAIN_PWRC_SOLANA_TO_SUI_LOCK_V1\0")
    .update(canonicalJson(input))
    .digest("hex");
}
