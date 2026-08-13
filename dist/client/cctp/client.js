import axios, {} from "axios";
/**
 * Read-only Circle attestation client.
 * CCTP burn/mint instructions remain chain-specific and should be constructed
 * from Circle's official program interfaces for the selected environment.
 */
export class CctpAttestationClient {
    baseUrl;
    http;
    constructor(baseUrl, http = axios.create({ timeout: 10_000 })) {
        this.baseUrl = baseUrl;
        this.http = http;
        if (!baseUrl.startsWith("https://"))
            throw new Error("CCTP_API_HTTPS_REQUIRED");
    }
    async fetchByTransactionHash(txHash) {
        if (!txHash)
            throw new Error("CCTP_TX_HASH_REQUIRED");
        const url = `${this.baseUrl.replace(/\/$/, "")}/messages?transactionHash=${encodeURIComponent(txHash)}`;
        const response = await this.http.get(url, {
            headers: { Accept: "application/json" },
        });
        return response.data;
    }
}
//# sourceMappingURL=client.js.map