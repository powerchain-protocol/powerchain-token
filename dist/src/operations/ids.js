function clean(value, field) {
    const normalized = value.trim();
    if (!normalized)
        throw new Error(`PWRC_${field}_REQUIRED`);
    if (normalized.length > 128)
        throw new Error(`PWRC_${field}_TOO_LONG`);
    return normalized;
}
export function canonicalMarketId(input) {
    if (input.version !== "1.0.0")
        throw new Error("PWRC_MARKET_ID_VERSION_INVALID");
    const provider = clean(input.provider, "MARKET_PROVIDER").toLowerCase();
    const network = clean(input.network, "MARKET_NETWORK").toLowerCase();
    const base = clean(input.baseAsset, "MARKET_BASE").toUpperCase();
    const quote = clean(input.quoteAsset, "MARKET_QUOTE").toUpperCase();
    if (base === quote)
        throw new Error("PWRC_MARKET_PAIR_IDENTICAL");
    const venue = input.venue ? `:${clean(input.venue, "MARKET_VENUE").toLowerCase()}` : "";
    const external = input.externalId ? `:${clean(input.externalId, "MARKET_EXTERNAL_ID")}` : "";
    return `market:${provider}:${network}:${base}/${quote}${venue}${external}`;
}
export function canonicalServiceId(input) {
    if (input.version !== "1.0.0")
        throw new Error("PWRC_SERVICE_ID_VERSION_INVALID");
    const kind = clean(input.kind, "SERVICE_KIND").toLowerCase();
    const id = clean(input.id, "SERVICE_ID").toLowerCase();
    const network = input.network
        ? `:${clean(input.network, "SERVICE_NETWORK").toLowerCase()}`
        : "";
    return `service:${kind}:${id}${network}`;
}
//# sourceMappingURL=ids.js.map