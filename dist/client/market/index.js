export * from "./circuit-breaker.js";
export * from "./oracle.js";
export * from "./pyth.js";
export * from "./birdeye.js";
import { pythPriceToNumber } from "./pyth.js";
export async function getPwrcMarketPrice(input) {
    const errors = [];
    if (input.pyth && input.pythFeedId) {
        try {
            const price = await input.pyth.getLatestPrice(input.pythFeedId);
            return {
                usd: pythPriceToNumber(price),
                source: "pyth",
                observedAt: price.publishTime,
            };
        }
        catch (error) {
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
        }
        catch (error) {
            errors.push(`BIRDEYE:${error instanceof Error ? error.message : String(error)}`);
        }
    }
    throw new Error(`PWRC_MARKET_PRICE_UNAVAILABLE:${errors.join("|") || "NO_PROVIDER_CONFIGURED"}`);
}
//# sourceMappingURL=index.js.map