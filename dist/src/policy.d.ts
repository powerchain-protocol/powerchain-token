export interface ObservedMint {
    mint: string;
    ownerProgram: string;
    decimals: number;
    supplyBaseUnits: bigint;
    mintAuthority: string | null;
    freezeAuthority: string | null;
}
export declare function verifyFinalizedMint(observed: ObservedMint, canonicalMint: string): string[];
export declare function assertGenesisSupply(raw: bigint): void;
//# sourceMappingURL=policy.d.ts.map