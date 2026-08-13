import { calculateToken2022TransferFeeBaseUnits, } from "../fees.js";
export function assertSolanaLockReceiptObservation(receipt) {
    if (receipt.version !== 1) {
        throw new Error("PWRC_LOCK_RECEIPT_VERSION_INVALID");
    }
    if (receipt.amountBaseUnits <= 0n ||
        receipt.wrappedAmountBaseUnits <= 0n) {
        throw new Error("PWRC_LOCK_RECEIPT_AMOUNT_INVALID");
    }
    const fee = calculateToken2022TransferFeeBaseUnits(receipt.amountBaseUnits);
    const expectedWrapped = receipt.amountBaseUnits - fee;
    if (receipt.wrappedAmountBaseUnits !==
        expectedWrapped) {
        throw new Error("PWRC_LOCK_RECEIPT_FEE_ADJUSTED_AMOUNT_MISMATCH");
    }
    if (!/^[a-f0-9]{64}$/i.test(receipt.transferIdHex)) {
        throw new Error("PWRC_LOCK_RECEIPT_TRANSFER_ID_INVALID");
    }
    if (!/^0x[a-f0-9]{64}$/i.test(receipt.suiRecipient)) {
        throw new Error("PWRC_LOCK_RECEIPT_SUI_RECIPIENT_INVALID");
    }
    if (receipt.sequence <= 0n) {
        throw new Error("PWRC_LOCK_RECEIPT_SEQUENCE_INVALID");
    }
    if (receipt.slot <= 0n) {
        throw new Error("PWRC_LOCK_RECEIPT_SLOT_INVALID");
    }
    if (!Number.isInteger(receipt.instructionIndex) ||
        receipt.instructionIndex < 0) {
        throw new Error("PWRC_LOCK_RECEIPT_INSTRUCTION_INDEX_INVALID");
    }
}
//# sourceMappingURL=receipt.js.map