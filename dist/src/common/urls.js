const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
export function normalizeUrl(raw, policy = {}) {
    const input = raw.trim();
    if (!input)
        throw new Error("POWERCHAIN_URL_REQUIRED");
    if (/\p{Cc}/u.test(input)) {
        throw new Error("POWERCHAIN_URL_CONTROL_CHARACTER_FORBIDDEN");
    }
    const maxLength = policy.maxLength ?? 2_048;
    if (input.length > maxLength) {
        throw new Error("POWERCHAIN_URL_TOO_LONG");
    }
    let url;
    try {
        url = new URL(input);
    }
    catch {
        throw new Error("POWERCHAIN_URL_INVALID");
    }
    if ((policy.requireHostname ?? true) && !url.hostname) {
        throw new Error("POWERCHAIN_URL_HOSTNAME_REQUIRED");
    }
    if (url.username || url.password) {
        throw new Error("POWERCHAIN_URL_CREDENTIALS_FORBIDDEN");
    }
    if (url.hash) {
        throw new Error("POWERCHAIN_URL_FRAGMENT_FORBIDDEN");
    }
    const protocols = policy.protocols ?? ["https:", "http:"];
    if (!protocols.includes(url.protocol)) {
        throw new Error("POWERCHAIN_URL_PROTOCOL_FORBIDDEN");
    }
    if (policy.httpsRequired && url.protocol !== "https:") {
        const localAllowed = policy.allowHttpLocalhost === true && LOCAL_HOSTS.has(url.hostname);
        if (!localAllowed)
            throw new Error("POWERCHAIN_HTTPS_REQUIRED");
    }
    return url.toString().replace(/\/$/, "");
}
export function normalizeRpcUrl(raw, production) {
    return normalizeUrl(raw, {
        httpsRequired: production,
        allowHttpLocalhost: !production,
        protocols: ["https:", "http:"],
        maxLength: 2_048,
        requireHostname: true,
    });
}
export function normalizeWebSocketUrl(raw, production) {
    return normalizeUrl(raw, {
        httpsRequired: false,
        protocols: production ? ["wss:"] : ["wss:", "ws:"],
        maxLength: 2_048,
        requireHostname: true,
    });
}
//# sourceMappingURL=urls.js.map