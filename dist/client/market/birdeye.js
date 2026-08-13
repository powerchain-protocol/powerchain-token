import axios, {} from "axios";
import { PublicKey } from "@solana/web3.js";
export class BirdeyeMarketClient {
    apiKey;
    http;
    baseUrl;
    constructor(options) {
        if (!options.apiKey)
            throw new Error("BIRDEYE_API_KEY_REQUIRED");
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl ?? "https://public-api.birdeye.so";
        if (!this.baseUrl.startsWith("https://")) {
            throw new Error("BIRDEYE_HTTPS_REQUIRED");
        }
        this.http = options.http ?? axios.create({ timeout: 8_000 });
    }
    headers() {
        return {
            "X-API-KEY": this.apiKey,
            "x-chain": "solana",
            Accept: "application/json",
        };
    }
    canonicalAddress(address) {
        return new PublicKey(address).toBase58();
    }
    async getPrice(address) {
        const canonical = this.canonicalAddress(address);
        const response = await this.http.get(`${this.baseUrl.replace(/\/$/, "")}/defi/price`, {
            params: { address: canonical },
            headers: this.headers(),
        });
        const data = response.data?.data;
        if (!data || typeof data.value !== "number" || !(data.value > 0)) {
            throw new Error("BIRDEYE_PRICE_UNAVAILABLE");
        }
        return {
            address: canonical,
            value: data.value,
            ...(typeof data.updateUnixTime === "number"
                ? { updateUnixTime: data.updateUnixTime }
                : {}),
        };
    }
    async getMarketData(address) {
        const canonical = this.canonicalAddress(address);
        const response = await this.http.get(`${this.baseUrl.replace(/\/$/, "")}/defi/v3/token/market-data`, {
            params: { address: canonical, ui_amount_mode: "raw" },
            headers: this.headers(),
        });
        const data = response.data?.data;
        if (!data)
            throw new Error("BIRDEYE_MARKET_DATA_UNAVAILABLE");
        return {
            address: canonical,
            ...data,
        };
    }
}
//# sourceMappingURL=birdeye.js.map