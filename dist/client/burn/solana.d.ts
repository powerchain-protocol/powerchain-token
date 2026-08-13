import { PublicKey, Transaction, type Connection } from "@solana/web3.js";
export declare function buildCanonicalPwrcBurnTransaction(input: {
    connection: Connection;
    mint: PublicKey;
    sourceTokenAccount: PublicKey;
    burnAuthority: PublicKey;
    burnBaseUnits: bigint;
}): Promise<Transaction>;
//# sourceMappingURL=solana.d.ts.map