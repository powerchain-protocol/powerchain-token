export function normalizeRpcUrl(
  value: string,
  production = false,
): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("PWRC_RPC_URL_INVALID");
  }

  if (url.username || url.password) {
    throw new Error("PWRC_RPC_CREDENTIALS_IN_URL_FORBIDDEN");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("PWRC_RPC_PROTOCOL_INVALID");
  }

  if (production && url.protocol !== "https:") {
    throw new Error("PWRC_PRODUCTION_RPC_HTTPS_REQUIRED");
  }

  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function normalizeWebSocketUrl(
  value: string,
  production = false,
): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("PWRC_WS_URL_INVALID");
  }

  if (url.username || url.password) {
    throw new Error("PWRC_WS_CREDENTIALS_IN_URL_FORBIDDEN");
  }

  if (!["ws:", "wss:"].includes(url.protocol)) {
    throw new Error("PWRC_WS_PROTOCOL_INVALID");
  }

  if (production && url.protocol !== "wss:") {
    throw new Error("PWRC_PRODUCTION_WS_WSS_REQUIRED");
  }

  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
