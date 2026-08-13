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
export declare function pwrcSolanaLockClaimHash(input: PwrcSolanaLockEventIdentity): string;
//# sourceMappingURL=lock-claim.d.ts.map