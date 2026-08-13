export const POWERCHAIN_OFFICIAL_LINKS = {
    website: "https://powerchain.energy",
    bridge: "https://bridge.powerchain.energy",
    app: "https://app.powerchain.energy",
    documentation: "https://docs.powerchain.energy",
    whitepaper: "https://whitepaper.powerchain.energy",
    x: "https://x.com/powerchain_ai",
    telegram: "https://t.me/powerchain_official",
};
export function assertCanonicalOfficialLinks(input) {
    if (input.external_url !==
        POWERCHAIN_OFFICIAL_LINKS.website) {
        throw new Error("PWRC_METADATA_WEBSITE_MISMATCH");
    }
    const candidates = [
        input.official_links,
        input.properties?.links,
    ];
    for (const links of candidates) {
        if (!links) {
            throw new Error("PWRC_METADATA_OFFICIAL_LINKS_MISSING");
        }
        for (const [key, expected] of Object.entries(POWERCHAIN_OFFICIAL_LINKS)) {
            if (links[key] !== expected) {
                throw new Error(`PWRC_METADATA_LINK_MISMATCH:${key}`);
            }
        }
    }
}
//# sourceMappingURL=official-links.js.map