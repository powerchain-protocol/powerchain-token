import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import {
  assertSolanaAddress,
  buildFeeQuote,
  parseBaseUnits,
  parseOperation,
  parseServiceFeeBps,
} from "./lib/fees.mjs";
import {
  createFixedWindowRateLimiter,
} from "./lib/rate-limit.mjs";
import {
  handleCdpRoute,
  isCdpRoute,
} from "./lib/cdp-routes.mjs";
import {
  apiIndex,
} from "./lib/api-registry.mjs";
import {
  bridgeStatus,
  quoteSolanaToSuiBridge,
} from "./lib/bridge-routes.mjs";
import {
  devnetStatus,
  mainnetStatus,
  readinessState,
} from "./lib/status.mjs";
import {
  publicFeePolicy,
  publicPlatformState,
} from "./lib/public-platform.mjs";

const host =
  process.env.PWRC_API_HOST ??
  "127.0.0.1";
const port =
  Number(
    process.env.PWRC_API_PORT ??
    "8787",
  );

if (
  !Number.isSafeInteger(port) ||
  port < 1 ||
  port > 65_535
) {
  throw new Error(
    "PWRC_API_PORT_INVALID",
  );
}

const serviceEnabled =
  process.env.PWRC_SERVICE_FEE_ENABLED ===
  "true";
const serviceBps =
  parseServiceFeeBps(
    process.env.PWRC_SERVICE_FEE_BPS ??
    "250",
  );
const serviceRecipientRaw =
  process.env.PWRC_SERVICE_FEE_RECIPIENT
    ?.trim() ||
  null;

const serviceRecipient =
  serviceRecipientRaw
    ? assertSolanaAddress(
        serviceRecipientRaw,
      )
    : null;

if (
  serviceEnabled &&
  !serviceRecipient
) {
  throw new Error(
    "PWRC_SERVICE_FEE_RECIPIENT_REQUIRED",
  );
}

const quoteTtlMs =
  Number(
    process.env.PWRC_QUOTE_TTL_MS ??
    "30000",
  );

if (
  !Number.isSafeInteger(
    quoteTtlMs,
  ) ||
  quoteTtlMs < 1_000 ||
  quoteTtlMs > 300_000
) {
  throw new Error(
    "PWRC_QUOTE_TTL_MS_INVALID",
  );
}

const apiRateLimit =
  Number(
    process.env.PWRC_API_RATE_LIMIT ??
    "120",
  );

if (
  !Number.isSafeInteger(
    apiRateLimit,
  ) ||
  apiRateLimit < 1 ||
  apiRateLimit > 100_000
) {
  throw new Error(
    "PWRC_API_RATE_LIMIT_INVALID",
  );
}

const checkRate =
  createFixedWindowRateLimiter({
    limit:
      apiRateLimit,
    windowMs:
      60_000,
  });

function cdpConfigured() {
  return Boolean(
    process.env.CDP_SQL_API_BEARER_TOKEN?.trim() ||
    process.env.CDP_SQL_API_TOKEN?.trim(),
  );
}

function requestId(req) {
  const incoming =
    req.headers["x-request-id"];

  if (
    typeof incoming === "string" &&
    /^[a-zA-Z0-9._:-]{1,128}$/.test(
      incoming,
    )
  ) {
    return incoming;
  }

  return crypto.randomUUID();
}

function commonHeaders() {
  return {
    "cache-control":
      "no-store",
    "x-content-type-options":
      "nosniff",
    "x-frame-options":
      "DENY",
    "referrer-policy":
      "no-referrer",
    "content-security-policy":
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  };
}

function json(
  res,
  status,
  payload,
  headers = {},
) {
  res.writeHead(
    status,
    {
      ...commonHeaders(),
      "content-type":
        "application/json; charset=utf-8",
      ...headers,
    },
  );

  res.end(
    JSON.stringify(payload),
  );
}

function raw(
  res,
  status,
  body,
  contentType,
  headers = {},
) {
  res.writeHead(
    status,
    {
      ...commonHeaders(),
      "content-type":
        contentType,
      ...headers,
    },
  );

  res.end(body);
}

function errorResponse(
  res,
  status,
  code,
  requestIdValue,
  headers = {},
) {
  return json(
    res,
    status,
    {
      error:
        code,
      errorCode:
        code,
      requestId:
        requestIdValue,
    },
    headers,
  );
}

function networkState() {
  const cluster =
    process.env.PWRC_CLUSTER ??
    "localnet";
  const suiNetwork =
    process.env.SUI_NETWORK ??
    "devnet";

  const tokenProgramId =
    cluster === "mainnet-beta"
      ? process.env.PWRC_TOKEN_PROGRAM_ID_MAINNET ??
        null
      : process.env.PWRC_TOKEN_PROGRAM_ID_DEVNET ??
        "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu";

  const lockProgramId =
    cluster === "localnet"
      ? "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr"
      : cluster === "mainnet-beta"
        ? process.env.PWRC_LOCK_PROGRAM_ID_MAINNET ??
          null
        : process.env.PWRC_LOCK_PROGRAM_ID_DEVNET ??
          null;

  return {
    version:
      "1.0.0",
    solana: {
      cluster,
      canonicalMint:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      token2022ProgramId:
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
      pwrcTokenProgramId:
        tokenProgramId,
      pwrcLockProgramId:
        lockProgramId,
    },
    sui: {
      network:
        suiNetwork,
      packageId:
        process.env.WPWRC_SUI_PACKAGE_ID ??
        null,
      coinType:
        process.env.WPWRC_SUI_COIN_TYPE ??
        null,
      bridgeControllerId:
        process.env.WPWRC_SUI_BRIDGE_CONTROLLER_ID ??
        null,
    },
    data: {
      cdpSql: {
        network:
          "solana-mainnet",
        configured:
          cdpConfigured(),
      },
    },
  };
}

function readOpenApiJson() {
  return JSON.parse(
    fs.readFileSync(
      "swagger/openapi.json",
      "utf8",
    ),
  );
}

const server =
  http.createServer(
    async (req, res) => {
      const id =
        requestId(req);

      const ip =
        req.socket.remoteAddress ??
        "unknown";
      const rate =
        checkRate(ip);

      res.setHeader(
        "x-request-id",
        id,
      );
      res.setHeader(
        "x-ratelimit-remaining",
        String(rate.remaining),
      );
      res.setHeader(
        "x-ratelimit-reset",
        String(rate.resetAt),
      );

      if (!rate.allowed) {
        return errorResponse(
          res,
          429,
          "PWRC_RATE_LIMITED",
          id,
          {
            "retry-after":
              String(
                Math.max(
                  1,
                  Math.ceil(
                    (
                      rate.resetAt -
                      Date.now()
                    ) /
                    1000,
                  ),
                ),
              ),
          },
        );
      }

      if (
        req.method !== "GET"
      ) {
        return errorResponse(
          res,
          405,
          "METHOD_NOT_ALLOWED",
          id,
          {
            allow:
              "GET",
          },
        );
      }

      const url =
        new URL(
          req.url ?? "/",
          `http://${host}:${port}`,
        );


      if (
        url.pathname ===
          "/swagger"
      ) {
        return raw(
          res,
          200,
          `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PowerChain Token API 1.0.0</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;color:#111;background:#f6f7f6}
body{margin:0}main{max-width:980px;margin:auto;padding:40px 20px}
.card{background:#fff;border:1px solid #e1e5e2;border-radius:16px;padding:20px;margin:16px 0}
code{word-break:break-word}.method{font-weight:800;color:#14532d}
a{color:#14532d}.muted{color:#667067}
</style>
</head>
<body><main>
<h1>PowerChain Token API</h1>
<p class="muted">OpenAPI 3.1 • API v1 • PowerChain 1.0.0</p>
<div class="card">
<p><a href="/api/v1/openapi.json">OpenAPI JSON</a> · <a href="/swagger/openapi.yaml">OpenAPI YAML</a></p>
</div>
<div id="routes"></div>
<script>
fetch("/api/v1").then(r=>r.json()).then(api=>{
  document.querySelector("#routes").innerHTML=api.endpoints.map(e =>
    '<div class="card"><span class="method">'+e.method+'</span> <code>'+e.path+'</code><h3>'+e.summary+'</h3><div class="muted">'+e.tag+' · '+e.operationId+'</div></div>'
  ).join("");
}).catch(()=>{document.querySelector("#routes").textContent="Unable to load endpoint index.";});
</script>
</main></body></html>`,
          "text/html; charset=utf-8",
          {
            "content-security-policy":
              "default-src 'none'; script-src 'unsafe-inline'; connect-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'",
          },
        );
      }

      if (
        url.pathname ===
          "/swagger/openapi.yaml" ||
        url.pathname ===
          "/swagger/swagger.yaml" ||
        url.pathname ===
          "/swagger.yaml"
      ) {
        return raw(
          res,
          200,
          fs.readFileSync(
            "swagger/openapi.yaml",
            "utf8",
          ),
          "application/yaml; charset=utf-8",
        );
      }

      if (
        url.pathname ===
          "/api/v1"
      ) {
        return json(
          res,
          200,
          {
            ...apiIndex(),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/health"
      ) {
        return json(
          res,
          200,
          {
            ok:
              true,
            version:
              "1.0.0",
            serviceFeeEnabled:
              serviceEnabled,
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/ready"
      ) {
        return json(
          res,
          200,
          {
            ...readinessState({
              cdpConfigured:
                cdpConfigured(),
            }),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/version"
      ) {
        return json(
          res,
          200,
          {
            version:
              "1.0.0",
            apiVersion:
              "v1",
            release:
              "powerchain-token-1.0.0",
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/openapi.json"
      ) {
        return json(
          res,
          200,
          readOpenApiJson(),
        );
      }



      if (
        url.pathname ===
          "/api/v1/status"
      ) {
        return json(
          res,
          200,
          {
            version:
              "1.0.0",
            runtime:
              readinessState({
                cdpConfigured:
                  cdpConfigured(),
              }),
            bridge:
              bridgeStatus(),
            devnet:
              devnetStatus(),
            mainnet:
              mainnetStatus(),
            requestId:
              id,
          },
        );
      }


      if (
        url.pathname ===
          "/api/v1/openapi.yaml"
      ) {
        return raw(
          res,
          200,
          fs.readFileSync(
            "swagger/openapi.yaml",
            "utf8",
          ),
          "application/yaml; charset=utf-8",
        );
      }

      if (
        url.pathname ===
          "/api/v1/platform"
      ) {
        return json(
          res,
          200,
          {
            ...publicPlatformState(),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/fees/policy"
      ) {
        return json(
          res,
          200,
          {
            ...publicFeePolicy(),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/token"
      ) {
        return json(
          res,
          200,
          {
            version:
              "1.0.0",
            name:
              "PowerChain",
            symbol:
              "PWRC",
            mint:
              "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
            tokenProgram:
              "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
            metadataProgram:
              "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            decimals:
              9,
            genesisSupplyTokens:
              "18446000000",
            genesisSupplyBaseUnits:
              "18446000000000000000",
            nativeTransferFeeBps:
              250,
            nativeTransferFeeCapTokens:
              "1000000",
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/network"
      ) {
        return json(
          res,
          200,
          {
            ...networkState(),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/fees/quote"
      ) {
        try {
          const amount =
            parseBaseUnits(
              url.searchParams.get(
                "amountBaseUnits",
              ),
            );
          const operation =
            parseOperation(
              url.searchParams.get(
                "operation",
              ),
            );

          const quote =
            buildFeeQuote({
              amount,
              operation,
              serviceEnabled,
              serviceBps,
              serviceRecipient,
              ttlMs:
                quoteTtlMs,
            });

          return json(
            res,
            200,
            {
              ...quote,
              requestId:
                id,
            },
          );
        } catch (error) {
          return errorResponse(
            res,
            400,
            error instanceof Error
              ? error.message
              : "PWRC_QUOTE_INVALID",
            id,
          );
        }
      }

      if (
        url.pathname ===
          "/api/v1/bridge/status"
      ) {
        return json(
          res,
          200,
          {
            ...bridgeStatus(),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/bridge/quote/solana-to-sui"
      ) {
        try {
          return json(
            res,
            200,
            {
              ...quoteSolanaToSuiBridge({
                amountBaseUnits:
                  url.searchParams.get(
                    "amountBaseUnits",
                  ),
                serviceEnabled,
                serviceBps,
                serviceRecipient,
                quoteTtlMs,
              }),
              requestId:
                id,
            },
          );
        } catch (error) {
          return errorResponse(
            res,
            400,
            error instanceof Error
              ? error.message
              : "PWRC_BRIDGE_QUOTE_INVALID",
            id,
          );
        }
      }

      if (
        url.pathname ===
          "/api/v1/release/status"
      ) {
        return json(
          res,
          200,
          {
            ...mainnetStatus(),
            requestId:
              id,
          },
        );
      }

      if (
        url.pathname ===
          "/api/v1/devnet/status"
      ) {
        return json(
          res,
          200,
          {
            ...devnetStatus(),
            requestId:
              id,
          },
        );
      }

      if (
        isCdpRoute(
          url.pathname,
        )
      ) {
        try {
          const payload =
            await handleCdpRoute(
              url,
            );

          if (payload) {
            return json(
              res,
              200,
              {
                ...payload,
                requestId:
                  id,
              },
            );
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "PWRC_CDP_SQL_ERROR";

          const status =
            message ===
              "PWRC_CDP_SQL_API_BEARER_TOKEN_REQUIRED"
              ? 503
              : message.startsWith(
                    "PWRC_CDP_SQL_REQUEST_FAILED:",
                  )
                ? 502
                : 400;

          return errorResponse(
            res,
            status,
            message,
            id,
          );
        }
      }

      return errorResponse(
        res,
        404,
        "NOT_FOUND",
        id,
      );
    },
  );

server.on(
  "clientError",
  (
    _error,
    socket,
  ) => {
    if (
      socket.writable
    ) {
      socket.end(
        "HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n",
      );
    }
  },
);

server.on(
  "error",
  (error) => {
    const code =
      error &&
      typeof error === "object" &&
      "code" in error
        ? error.code
        : "UNKNOWN";

    process.stderr.write(
      `PWRC_API_LISTEN_ERROR:${String(code)}:${host}:${port}\n`,
    );
    process.exitCode =
      1;
  },
);

server.requestTimeout =
  15_000;
server.headersTimeout =
  10_000;
server.keepAliveTimeout =
  5_000;
server.maxRequestsPerSocket =
  1_000;

server.listen(
  port,
  host,
  () => {
    process.stderr.write(
      JSON.stringify({
        timestamp:
          new Date()
            .toISOString(),
        level:
          "info",
        component:
          "@powerchain/api",
        message:
          "api_started",
        host,
        port,
        version:
          "1.0.0",
      }) +
      "\n",
    );
  },
);
