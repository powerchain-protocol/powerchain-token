import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import WebSocket, {
  type ClientOptions,
} from "ws";

const DEFAULT_TIMEOUT_MS =
  10_000;
const DEFAULT_WS_HEARTBEAT_MS =
  30_000;

function parsePositiveInteger(
  raw:
    string | undefined,
  fallback:
    number,
  code:
    string,
): number {
  if (!raw) {
    return fallback;
  }

  const value =
    Number(raw);

  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <= 0
  ) {
    throw new Error(code);
  }

  return value;
}

function parseAllowedHosts(
  raw:
    string | undefined,
): Set<string> {
  return new Set(
    (
      raw ?? ""
    )
      .split(",")
      .map(
        (value) =>
          value
            .trim()
            .toLowerCase(),
      )
      .filter(Boolean),
  );
}

function assertAllowedUrl(
  rawUrl:
    string,
  {
    allowedProtocols,
    allowedHosts,
    code,
  }: {
    allowedProtocols:
      ReadonlySet<string>;
    allowedHosts:
      ReadonlySet<string>;
    code:
      string;
  },
): URL {
  let url:
    URL;

  try {
    url =
      new URL(
        rawUrl,
      );
  } catch {
    throw new Error(code);
  }

  if (
    !allowedProtocols.has(
      url.protocol,
    ) ||
    !allowedHosts.has(
      url.hostname
        .toLowerCase(),
    ) ||
    url.username ||
    url.password
  ) {
    throw new Error(code);
  }

  return url;
}

export interface PowerChainHttpProxyOptions {
  allowedHosts?:
    Iterable<string>;
  timeoutMs?:
    number;
}

export function createPowerChainHttpProxy(
  options:
    PowerChainHttpProxyOptions =
      {},
): {
  request:
    <T = unknown>(
      url:
        string,
      config?:
        AxiosRequestConfig,
    ) => Promise<T>;
  client:
    AxiosInstance;
} {
  const envAllowed =
    parseAllowedHosts(
      process.env[
        "POWERCHAIN_PROXY_ALLOWED_HOSTS"
      ],
    );
  const configured =
    new Set(
      [
        ...envAllowed,
        ...(
          options.allowedHosts ??
          []
        ),
      ].map(
        (value) =>
          value
            .trim()
            .toLowerCase(),
      ),
    );
  const timeout =
    options.timeoutMs ??
    parsePositiveInteger(
      process.env[
        "POWERCHAIN_PROXY_TIMEOUT_MS"
      ],
      DEFAULT_TIMEOUT_MS,
      "POWERCHAIN_PROXY_TIMEOUT_MS_INVALID",
    );

  const client =
    axios.create({
      timeout,
      maxRedirects:
        0,
      validateStatus:
        (status) =>
          status >= 200 &&
          status < 500,
    });

  async function request<
    T = unknown,
  >(
    rawUrl:
      string,
    config:
      AxiosRequestConfig =
        {},
  ): Promise<T> {
    if (
      process.env[
        "POWERCHAIN_PROXY_ENABLED"
      ] !== "true"
    ) {
      throw new Error(
        "POWERCHAIN_PROXY_DISABLED",
      );
    }

    const url =
      assertAllowedUrl(
        rawUrl,
        {
          allowedProtocols:
            new Set([
              "https:",
            ]),
          allowedHosts:
            configured,
          code:
            "POWERCHAIN_PROXY_TARGET_NOT_ALLOWED",
        },
      );

    const response =
      await client.request<T>({
        ...config,
        url:
          url.toString(),
        method:
          config.method ??
          "GET",
      });

    return response.data;
  }

  return {
    request,
    client,
  };
}

export interface PowerChainWebSocketProxyOptions {
  allowedHosts?:
    Iterable<string>;
  heartbeatMs?:
    number;
}

export function createPowerChainWebSocketProxy(
  rawUrl:
    string,
  options:
    PowerChainWebSocketProxyOptions =
      {},
): WebSocket {
  if (
    process.env[
      "POWERCHAIN_WS_PROXY_ENABLED"
    ] !== "true"
  ) {
    throw new Error(
      "POWERCHAIN_WS_PROXY_DISABLED",
    );
  }

  const envAllowed =
    parseAllowedHosts(
      process.env[
        "POWERCHAIN_WS_PROXY_ALLOWED_HOSTS"
      ],
    );
  const configured =
    new Set(
      [
        ...envAllowed,
        ...(
          options.allowedHosts ??
          []
        ),
      ].map(
        (value) =>
          value
            .trim()
            .toLowerCase(),
      ),
    );

  const url =
    assertAllowedUrl(
      rawUrl,
      {
        allowedProtocols:
          new Set([
            "wss:",
          ]),
        allowedHosts:
          configured,
        code:
          "POWERCHAIN_WS_PROXY_TARGET_NOT_ALLOWED",
      },
    );

  const heartbeatMs =
    options.heartbeatMs ??
    parsePositiveInteger(
      process.env[
        "POWERCHAIN_WS_HEARTBEAT_MS"
      ],
      DEFAULT_WS_HEARTBEAT_MS,
      "POWERCHAIN_WS_HEARTBEAT_MS_INVALID",
    );

  const wsOptions:
    ClientOptions = {
      handshakeTimeout:
        10_000,
      perMessageDeflate:
        false,
    };

  const socket =
    new WebSocket(
      url,
      wsOptions,
    );

  let heartbeat:
    NodeJS.Timeout |
    null =
      null;

  socket.on(
    "open",
    () => {
      heartbeat =
        setInterval(
          () => {
            if (
              socket.readyState ===
                WebSocket.OPEN
            ) {
              socket.ping();
            }
          },
          heartbeatMs,
        );

      heartbeat.unref();
    },
  );

  socket.once(
    "close",
    () => {
      if (heartbeat) {
        clearInterval(
          heartbeat,
        );
      }
    },
  );

  socket.once(
    "error",
    () => {
      if (heartbeat) {
        clearInterval(
          heartbeat,
        );
      }
    },
  );

  return socket;
}
