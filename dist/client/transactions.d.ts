import { Connection, Keypair, PublicKey, type Commitment, type TransactionSignature } from "@solana/web3.js";
import { quoteToken2022TransferFee } from "../src/fees.js";
export interface SendPwrcTransferInput {
    connection: Connection;
    signer: Keypair;
    mint: PublicKey;
    source: PublicKey;
    destination: PublicKey;
    amountBaseUnits: bigint;
    commitment?: Commitment;
    simulate?: boolean;
}
export interface PwrcTransferResult {
    signature: TransactionSignature;
    quote: ReturnType<typeof quoteToken2022TransferFee>;
    blockhash: string;
    lastValidBlockHeight: number;
}
export declare function validatePwrcTransferAccounts(input: {
    connection: Connection;
    owner: PublicKey;
    mint: PublicKey;
    source: PublicKey;
    destination: PublicKey;
    amountBaseUnits: bigint;
}): Promise<void>;
export declare function sendPwrcTransfer(input: SendPwrcTransferInput): Promise<PwrcTransferResult>;
export declare function reconcilePwrcTransferSignature(connection: Connection, signature: TransactionSignature): Promise<"finalized" | "failed" | "unknown">;
/** @deprecated Canonical PWRC fees are native Token-2022 fees. */
export declare const sendPwrcProtocolTransfer: typeof sendPwrcTransfer;
//# sourceMappingURL=transactions.d.ts.map