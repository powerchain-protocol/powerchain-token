import type { PublicKey, Signer } from "@solana/web3.js";
export declare function createPwrcTransferInstruction(input: {
    source: PublicKey;
    mint: PublicKey;
    destination: PublicKey;
    authority: PublicKey;
    amountBaseUnits: bigint;
    multiSigners?: (PublicKey | Signer)[];
}): import("@solana/web3.js").TransactionInstruction;
//# sourceMappingURL=transfer.d.ts.map