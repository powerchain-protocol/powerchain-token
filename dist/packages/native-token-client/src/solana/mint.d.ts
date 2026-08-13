import type { Commitment, Connection, PublicKey } from "@solana/web3.js";
export declare function assertPwrcMint(input: {
    connection: Connection;
    mint: PublicKey;
    commitment?: Commitment;
    requireFixedGenesisSupply?: boolean;
    requireMintAuthorityRevoked?: boolean;
    requireCanonicalMintAddress?: boolean;
}): Promise<void>;
//# sourceMappingURL=mint.d.ts.map