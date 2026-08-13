import { type AxiosInstance } from "axios";
export interface BirdeyeClientOptions {
    apiKey: string;
    http?: AxiosInstance;
    baseUrl?: string;
}
export interface BirdeyePriceResult {
    address: string;
    value: number;
    updateUnixTime?: number;
}
export interface BirdeyeMarketData {
    address: string;
    price?: number;
    liquidity?: number;
    marketCap?: number;
    volume24h?: number;
    [key: string]: unknown;
}
export declare class BirdeyeMarketClient {
    readonly apiKey: string;
    readonly http: AxiosInstance;
    readonly baseUrl: string;
    constructor(options: BirdeyeClientOptions);
    private headers;
    private canonicalAddress;
    getPrice(address: string): Promise<BirdeyePriceResult>;
    getMarketData(address: string): Promise<BirdeyeMarketData>;
}
//# sourceMappingURL=birdeye.d.ts.map