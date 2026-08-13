export type PwrcMarketProvider = "pyth" | "birdeye" | "dex" | "custom";
export type PwrcServiceKind = "ai-compute" | "x402" | "market-data" | "bridge" | "checkout" | "proof" | "status";
export interface PwrcMarketId {
    version: "1.0.0";
    provider: PwrcMarketProvider;
    network: string;
    baseAsset: string;
    quoteAsset: string;
    venue?: string;
    externalId?: string;
}
export interface PwrcServiceId {
    version: "1.0.0";
    kind: PwrcServiceKind;
    id: string;
    network?: string;
}
export declare function canonicalMarketId(input: PwrcMarketId): string;
export declare function canonicalServiceId(input: PwrcServiceId): string;
//# sourceMappingURL=ids.d.ts.map