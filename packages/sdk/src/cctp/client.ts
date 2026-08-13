import axios, { type AxiosInstance } from "axios";

export interface CircleAttestationResponse {
  status?: string;
  messages?: unknown[];
  [key: string]: unknown;
}

/**
 * Read-only Circle attestation client.
 * CCTP burn/mint instructions remain chain-specific and should be constructed
 * from Circle's official program interfaces for the selected environment.
 */
export class CctpAttestationClient {
  constructor(
    readonly baseUrl: string,
    readonly http: AxiosInstance = axios.create({ timeout: 10_000 }),
  ) {
    if (!baseUrl.startsWith("https://")) throw new Error("CCTP_API_HTTPS_REQUIRED");
  }

  async fetchByTransactionHash(txHash: string): Promise<CircleAttestationResponse> {
    if (!txHash) throw new Error("CCTP_TX_HASH_REQUIRED");
    const url = `${this.baseUrl.replace(/\/$/, "")}/messages?transactionHash=${encodeURIComponent(txHash)}`;
    const response = await this.http.get<CircleAttestationResponse>(url, {
      headers: { Accept: "application/json" },
    });
    return response.data;
  }
}
