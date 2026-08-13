import { type AxiosInstance, type AxiosResponse } from "axios";
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
export declare class X402HttpClient {
    readonly http: AxiosInstance;
    constructor(options?: X402HttpClientOptions);
    request<T>(url: string): Promise<AxiosResponse<T>>;
}
//# sourceMappingURL=client.d.ts.map