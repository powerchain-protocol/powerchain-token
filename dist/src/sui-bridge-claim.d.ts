export interface SolanaToSuiMintAuthorization {
    version: "1.0.0";
    claimHashHex: string;
    solanaCluster: "devnet" | "mainnet-beta";
    solanaSlot: string;
    sourceSignature: string;
    instructionIndex: number;
    canonicalMint: string;
    lockVault: string;
    amountBaseUnits: string;
    suiRecipient: string;
    observedAt: string;
    expiresAt: string;
    verifierId: string;
}
export declare function assertMintAuthorization(auth: SolanaToSuiMintAuthorization, now?: number): void;
export declare function mintAuthorizationFingerprint(auth: SolanaToSuiMintAuthorization): string;
//# sourceMappingURL=sui-bridge-claim.d.ts.map