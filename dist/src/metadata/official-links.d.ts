export declare const POWERCHAIN_OFFICIAL_LINKS: {
    readonly website: "https://powerchain.energy";
    readonly bridge: "https://bridge.powerchain.energy";
    readonly app: "https://app.powerchain.energy";
    readonly documentation: "https://docs.powerchain.energy";
    readonly whitepaper: "https://whitepaper.powerchain.energy";
    readonly x: "https://x.com/powerchain_ai";
    readonly telegram: "https://t.me/powerchain_official";
};
export type PowerChainOfficialLinks = typeof POWERCHAIN_OFFICIAL_LINKS;
export declare function assertCanonicalOfficialLinks(input: {
    external_url?: string;
    official_links?: Partial<PowerChainOfficialLinks>;
    properties?: {
        links?: Partial<PowerChainOfficialLinks>;
    };
}): void;
//# sourceMappingURL=official-links.d.ts.map