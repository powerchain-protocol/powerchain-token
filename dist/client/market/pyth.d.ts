import { type AxiosInstance } from "axios";
export interface PythPrice {
    price: bigint;
    conf: bigint;
    expo: number;
    publishTime: number;
}
export interface PythHermesPriceUpdate {
    id: string;
    price?: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
    };
}
export interface PythClientOptions {
    hermesUrl?: string;
    http?: AxiosInstance;
    maxPriceAgeSeconds?: number;
}
export declare class PythMarketClient {
    readonly hermesUrl: string;
    readonly http: AxiosInstance;
    readonly maxPriceAgeSeconds: number;
    constructor(options?: PythClientOptions);
    getLatestPrice(feedId: string): Promise<PythPrice>;
}
export declare function pythPriceToNumber(price: PythPrice): number;
//# sourceMappingURL=pyth.d.ts.map