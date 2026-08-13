export interface UrlPolicy {
    httpsRequired?: boolean;
    allowHttpLocalhost?: boolean;
    protocols?: readonly string[];
    maxLength?: number;
    requireHostname?: boolean;
}
export declare function normalizeUrl(raw: string, policy?: UrlPolicy): string;
export declare function normalizeRpcUrl(raw: string, production: boolean): string;
export declare function normalizeWebSocketUrl(raw: string, production: boolean): string;
//# sourceMappingURL=urls.d.ts.map