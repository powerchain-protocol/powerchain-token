import axios, { type AxiosInstance } from "axios";
import { PublicKey } from "@solana/web3.js";

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

export class BirdeyeMarketClient {
  readonly apiKey: string;
  readonly http: AxiosInstance;
  readonly baseUrl: string;

  constructor(options: BirdeyeClientOptions) {
    if (!options.apiKey) throw new Error("BIRDEYE_API_KEY_REQUIRED");
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://public-api.birdeye.so";
    if (!this.baseUrl.startsWith("https://")) {
      throw new Error("BIRDEYE_HTTPS_REQUIRED");
    }
    this.http = options.http ?? axios.create({ timeout: 8_000 });
  }

  private headers() {
    return {
      "X-API-KEY": this.apiKey,
      "x-chain": "solana",
      Accept: "application/json",
    };
  }

  private canonicalAddress(address: string): string {
    return new PublicKey(address).toBase58();
  }

  async getPrice(address: string): Promise<BirdeyePriceResult> {
    const canonical = this.canonicalAddress(address);
    const response = await this.http.get(
      `${this.baseUrl.replace(/\/$/, "")}/defi/price`,
      {
        params: { address: canonical },
        headers: this.headers(),
      },
    );

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

  async getMarketData(address: string): Promise<BirdeyeMarketData> {
    const canonical = this.canonicalAddress(address);
    const response = await this.http.get(
      `${this.baseUrl.replace(/\/$/, "")}/defi/v3/token/market-data`,
      {
        params: { address: canonical, ui_amount_mode: "raw" },
        headers: this.headers(),
      },
    );

    const data = response.data?.data;
    if (!data) throw new Error("BIRDEYE_MARKET_DATA_UNAVAILABLE");

    return {
      address: canonical,
      ...data,
    };
  }
}
