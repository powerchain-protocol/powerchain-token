export * from "./circuit-breaker.js";
export * from "./oracle.js";
export * from "./pyth.js";
export * from "./birdeye.js";

import type { PythMarketClient } from "./pyth.js";
import { pythPriceToNumber } from "./pyth.js";
import type { BirdeyeMarketClient } from "./birdeye.js";

export interface MarketPrice {
  usd: number;
  source: "pyth" | "birdeye";
  observedAt: number;
}

export async function getPwrcMarketPrice(input: {
  pyth?: PythMarketClient;
  pythFeedId?: string;
  birdeye?: BirdeyeMarketClient;
  mintAddress?: string;
}): Promise<MarketPrice> {
  const errors: string[] = [];

  if (input.pyth && input.pythFeedId) {
    try {
      const price = await input.pyth.getLatestPrice(input.pythFeedId);
      return {
        usd: pythPriceToNumber(price),
        source: "pyth",
        observedAt: price.publishTime,
      };
    } catch (error) {
      errors.push(`PYTH:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (input.birdeye && input.mintAddress) {
    try {
      const price = await input.birdeye.getPrice(input.mintAddress);
      return {
        usd: price.value,
        source: "birdeye",
        observedAt: price.updateUnixTime ?? Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      errors.push(`BIRDEYE:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`PWRC_MARKET_PRICE_UNAVAILABLE:${errors.join("|") || "NO_PROVIDER_CONFIGURED"}`);
}
