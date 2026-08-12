export interface UrlPolicy {
  httpsRequired?: boolean;
  allowHttpLocalhost?: boolean;
  protocols?: readonly string[];
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function normalizeUrl(
  raw: string,
  policy: UrlPolicy = {},
): string {
  const input = raw.trim();
  if (!input) throw new Error("POWERCHAIN_URL_REQUIRED");

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("POWERCHAIN_URL_INVALID");
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
    const localAllowed =
      policy.allowHttpLocalhost === true && LOCAL_HOSTS.has(url.hostname);
    if (!localAllowed) throw new Error("POWERCHAIN_HTTPS_REQUIRED");
  }

  return url.toString().replace(/\/$/, "");
}

export function normalizeRpcUrl(raw: string, production: boolean): string {
  return normalizeUrl(raw, {
    httpsRequired: production,
    allowHttpLocalhost: !production,
    protocols: ["https:", "http:"],
  });
}

export function normalizeWebSocketUrl(raw: string, production: boolean): string {
  return normalizeUrl(raw, {
    httpsRequired: false,
    protocols: production ? ["wss:"] : ["wss:", "ws:"],
  });
}
