import axios, {} from "axios";
export class PythMarketClient {
    hermesUrl;
    http;
    maxPriceAgeSeconds;
    constructor(options = {}) {
        this.hermesUrl = options.hermesUrl ?? "https://hermes.pyth.network";
        if (!this.hermesUrl.startsWith("https://")) {
            throw new Error("PYTH_HERMES_HTTPS_REQUIRED");
        }
        this.http = options.http ?? axios.create({ timeout: 8_000 });
        this.maxPriceAgeSeconds = options.maxPriceAgeSeconds ?? 60;
    }
    async getLatestPrice(feedId) {
        if (!/^(0x)?[a-fA-F0-9]{64}$/.test(feedId)) {
            throw new Error("PYTH_FEED_ID_INVALID");
        }
        const normalized = feedId.startsWith("0x") ? feedId.slice(2) : feedId;
        const response = await this.http.get(`${this.hermesUrl.replace(/\/$/, "")}/v2/updates/price/latest`, {
            params: {
                "ids[]": normalized,
                parsed: true,
            },
            headers: { Accept: "application/json" },
        });
        const update = response.data?.[0];
        if (!update?.price)
            throw new Error("PYTH_PRICE_NOT_FOUND");
        const price = {
            price: BigInt(update.price.price),
            conf: BigInt(update.price.conf),
            expo: update.price.expo,
            publishTime: update.price.publish_time,
        };
        const now = Math.floor(Date.now() / 1000);
        if (price.publishTime > now + 30)
            throw new Error("PYTH_PRICE_FROM_FUTURE");
        if (now - price.publishTime > this.maxPriceAgeSeconds) {
            throw new Error("PYTH_PRICE_STALE");
        }
        if (price.price <= 0n)
            throw new Error("PYTH_PRICE_NON_POSITIVE");
        return price;
    }
}
export function pythPriceToNumber(price) {
    // UI/display helper only. Never use this Number result for token settlement.
    return Number(price.price) * 10 ** price.expo;
}
//# sourceMappingURL=pyth.js.map