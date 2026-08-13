import type { ClientWithCoreApi } from "@mysten/sui/client";
export interface WpwrcBalanceSnapshot {
    owner: string;
    coinType: string;
    decimals: 9;
    totalBaseUnits: bigint;
    coinObjectBaseUnits: bigint;
    addressBalanceBaseUnits: bigint;
}
export interface WpwrcCoinObject {
    objectId: string;
    balanceBaseUnits: bigint;
    type: string;
}
export declare function assertSuiAddress(value: string): string;
export declare function wpwrcCoinType(packageId: string): string;
export declare function getWpwrcBalance(client: ClientWithCoreApi, input: {
    owner: string;
    coinType: string;
}): Promise<WpwrcBalanceSnapshot>;
export declare function listWpwrcCoinObjects(client: ClientWithCoreApi, input: {
    owner: string;
    coinType: string;
    limit?: number;
    maxPages?: number;
}): Promise<WpwrcCoinObject[]>;
export declare function assertWpwrcCoinMetadata(client: ClientWithCoreApi, coinType: string): Promise<void>;
//# sourceMappingURL=accounts.d.ts.map