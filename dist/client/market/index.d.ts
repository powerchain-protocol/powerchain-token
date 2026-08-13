export * from "./circuit-breaker.js";
export * from "./oracle.js";
export * from "./pyth.js";
export * from "./birdeye.js";
import type { PythMarketClient } from "./pyth.js";
import type { BirdeyeMarketClient } from "./birdeye.js";
export interface MarketPrice {
    usd: number;
    source: "pyth" | "birdeye";
    observedAt: number;
}
export declare function getPwrcMarketPrice(input: {
    pyth?: PythMarketClient;
    pythFeedId?: string;
    birdeye?: BirdeyeMarketClient;
    mintAddress?: string;
}): Promise<MarketPrice>;
//# sourceMappingURL=index.d.ts.map