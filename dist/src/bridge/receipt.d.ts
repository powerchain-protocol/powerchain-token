export interface SolanaLockReceiptObservation {
    version: 1;
    lockProgramId: string;
    bridgeConfig: string;
    receipt: string;
    canonicalMint: string;
    vault: string;
    owner: string;
    amountBaseUnits: bigint;
    wrappedAmountBaseUnits: bigint;
    transferIdHex: string;
    suiRecipient: string;
    sequence: bigint;
    slot: bigint;
    transactionSignature: string;
    instructionIndex: number;
}
export declare function assertSolanaLockReceiptObservation(receipt: SolanaLockReceiptObservation): void;
//# sourceMappingURL=receipt.d.ts.map