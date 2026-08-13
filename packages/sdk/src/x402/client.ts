import axios, { type AxiosInstance, type AxiosResponse } from "axios";

export interface X402HttpClientOptions {
  axiosInstance?: AxiosInstance;
  maxRedirects?: number;
  timeoutMs?: number;
}

/**
 * Thin transport helper only.
 * It deliberately does not auto-sign arbitrary 402 challenges.
 * The caller must validate requirements and explicitly approve payment.
 */
export class X402HttpClient {
  readonly http: AxiosInstance;

  constructor(options: X402HttpClientOptions = {}) {
    this.http =
      options.axiosInstance ??
      axios.create({
        timeout: options.timeoutMs ?? 10_000,
        maxRedirects: options.maxRedirects ?? 0,
      });
  }

  async request<T>(url: string): Promise<AxiosResponse<T>> {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error("X402_HTTPS_REQUIRED");
    return this.http.get<T>(url, {
      validateStatus: (status) => status === 200 || status === 402,
    });
  }
}
