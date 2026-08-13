import { Transaction } from "@mysten/sui/transactions";
export declare function buildLowerCanonicalSupplyCeilingTransaction(input: {
    packageId: string;
    bridgeControllerId: string;
    quarterId: bigint;
    newCanonicalSupplyCeilingBaseUnits: bigint;
    canonicalBurnEvidenceHash: Uint8Array;
}): Transaction;
//# sourceMappingURL=quarterly-burn.d.ts.map