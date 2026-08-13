import axios, {} from "axios";
/**
 * Thin transport helper only.
 * It deliberately does not auto-sign arbitrary 402 challenges.
 * The caller must validate requirements and explicitly approve payment.
 */
export class X402HttpClient {
    http;
    constructor(options = {}) {
        this.http =
            options.axiosInstance ??
                axios.create({
                    timeout: options.timeoutMs ?? 10_000,
                    maxRedirects: options.maxRedirects ?? 0,
                });
    }
    async request(url) {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:")
            throw new Error("X402_HTTPS_REQUIRED");
        return this.http.get(url, {
            validateStatus: (status) => status === 200 || status === 402,
        });
    }
}
//# sourceMappingURL=client.js.map