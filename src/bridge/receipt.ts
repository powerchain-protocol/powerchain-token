export interface SolanaLockReceiptObservation {
  version: 1; lockProgramId: string; bridgeConfig: string; receipt: string;
  canonicalMint: string; vault: string; owner: string;
  amountBaseUnits: bigint; wrappedAmountBaseUnits: bigint;
  transferIdHex: string; suiRecipient: string; sequence: bigint; slot: bigint;
  transactionSignature: string; instructionIndex: number;
}
export function assertSolanaLockReceiptObservation(receipt: SolanaLockReceiptObservation): void {
  if (receipt.version !== 1) throw new Error("PWRC_LOCK_RECEIPT_VERSION_INVALID");
  if (receipt.amountBaseUnits <= 0n || receipt.wrappedAmountBaseUnits <= 0n) throw new Error("PWRC_LOCK_RECEIPT_AMOUNT_INVALID");
  if (receipt.amountBaseUnits !== receipt.wrappedAmountBaseUnits) throw new Error("PWRC_LOCK_RECEIPT_1_TO_1_AMOUNT_MISMATCH");
  if (!/^[a-f0-9]{64}$/i.test(receipt.transferIdHex)) throw new Error("PWRC_LOCK_RECEIPT_TRANSFER_ID_INVALID");
  if (!/^0x[a-f0-9]{64}$/i.test(receipt.suiRecipient)) throw new Error("PWRC_LOCK_RECEIPT_SUI_RECIPIENT_INVALID");
  if (receipt.sequence <= 0n) throw new Error("PWRC_LOCK_RECEIPT_SEQUENCE_INVALID");
  if (receipt.slot <= 0n) throw new Error("PWRC_LOCK_RECEIPT_SLOT_INVALID");
  if (!Number.isInteger(receipt.instructionIndex) || receipt.instructionIndex < 0) throw new Error("PWRC_LOCK_RECEIPT_INSTRUCTION_INDEX_INVALID");
}
