import "dotenv/config";
process.env.WS_NO_UTF_8_VALIDATE ??= "1";
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
  createTokenBucketRateLimiter,
  parseTrustedProxyAddresses,
  resolveRateLimitClientKey,
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
  quoteSuiToSolanaBridge,
} from "./lib/bridge-routes.mjs";
import {
  bridgeLifecyclePolicy,
} from "./lib/bridge-lifecycle.mjs";
import {
  bridgeExecutionPolicy,
} from "./lib/bridge-plan.mjs";
import {
  bridgeReconciliationPolicy,
} from "./lib/bridge-reconciliation.mjs";
import {
  bridgeRecoveryPolicy,
} from "./lib/bridge-recovery.mjs";
import {
  bridgeAuditPolicy,
} from "./lib/bridge-audit.mjs";
import {
  bridgeRiskPolicy,
} from "./lib/bridge-risk.mjs";
import {
  bridgeGovernancePolicy,
} from "./lib/bridge-governance.mjs";
import {
  bridgeSafetyPolicy,
} from "./lib/bridge-safety.mjs";
import {
  bridgePolicyConfigSurface,
} from "./lib/bridge-policy-config.mjs";
import {
  devnetStatus,
  mainnetStatus,
  readinessState,
} from "./lib/status.mjs";
import {
  publicFeePolicy,
  publicPlatformState,
} from "./lib/public-platform.mjs";
import {
  publicMetadataState,
} from "./lib/metadata.mjs";
import {
  powerChainTokenApiIndex,
  publicAssetBySymbol,
  publicAssetRegistry,
} from "./lib/assets.mjs";
import {
  nativePwrcPolicy,
} from "./lib/native-token.mjs";
import {
  canonicalTokenPolicy,
  canonicalTokenProfile,
} from "./lib/token-policy.mjs";
import {
  canonicalTokenDescription,
} from "./lib/token-description.mjs";
import {
  nativeTransferRuntimePolicy,
  utilityRuntimePolicy,
} from "./lib/token-runtime.mjs";
import {
  liveNativePwrcAttestation,
  nativePwrcVerificationConfig,
} from "./lib/native-attestation.mjs";
import {
  heliusConfigStatus,
  heliusHealth,
  heliusPwrcAsset,
} from "./lib/helius.mjs";
import {
  resolveServiceFeeRecipient,
} from "./lib/service-fee-recipients.mjs";
import {
  installGracefulHttpShutdown,
} from "../shared/graceful-http.mjs";

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

const apiRateBurst =
  Number(
    process.env.PWRC_API_RATE_LIMIT_BURST ??
    String(apiRateLimit),
  );

const expensiveApiRateLimit =
  Number(
    process.env.PWRC_EXPENSIVE_API_RATE_LIMIT ??
    "20",
  );
const expensiveApiRateBurst =
  Number(
    process.env.PWRC_EXPENSIVE_API_RATE_LIMIT_BURST ??
    String(expensiveApiRateLimit),
  );

if (
  !Number.isSafeInteger(expensiveApiRateLimit) ||
  expensiveApiRateLimit < 1 ||
  expensiveApiRateLimit > apiRateLimit ||
  !Number.isSafeInteger(apiRateBurst) ||
  apiRateBurst < 1 ||
  !Number.isSafeInteger(expensiveApiRateBurst) ||
  expensiveApiRateBurst < 1
) {
  throw new Error(
    "PWRC_API_RATE_LIMIT_INVALID",
  );
}

const trustedProxyAddresses =
  parseTrustedProxyAddresses(
    process.env.PWRC_TRUSTED_PROXY_ADDRESSES,
  );
const trustedProxyHops =
  Number(
    process.env.PWRC_TRUSTED_PROXY_HOPS ??
    "1",
  );

if (
  !Number.isSafeInteger(trustedProxyHops) ||
  trustedProxyHops < 1 ||
  trustedProxyHops > 8
) {
  throw new Error(
    "PWRC_TRUSTED_PROXY_HOPS_INVALID",
  );
}

const checkRate =
  createTokenBucketRateLimiter({
    ratePerMinute:
      apiRateLimit,
    burst:
      apiRateBurst,
    maxBuckets:
      10_000,
  });
const checkExpensiveRate =
  createTokenBucketRateLimiter({
    ratePerMinute:
      expensiveApiRateLimit,
    burst:
      expensiveApiRateBurst,
    maxBuckets:
      10_000,
  });

const expensivePaths =
  new Set([
    "/api/v1/token/native-attestation",
    "/api/v1/integrations/helius/health",
    "/api/v1/data/solana/pwrc/helius/asset",
  ]);


const cacheableHeadPaths =
  new Set([
    "/api/v1/token",
    "/api/v1/token/",
    "/api/v1/token/metadata",
    "/api/v1/token/description",
    "/api/v1/token/fees",
    "/api/v1/assets",
    "/api/v1/assets/",
    "/api/v1/token/native-policy",
    "/api/v1/token/policy",
    "/api/v1/metadata",
    "/api/v1/openapi.json",
  ]);

function isCacheableHeadPath(
  pathname,
) {
  return (
    cacheableHeadPaths.has(
      pathname,
    ) ||
    (
      pathname.startsWith(
        "/api/v1/assets/",
      ) &&
      pathname !==
        "/api/v1/assets/"
    )
  );
}

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


function cacheableRepresentation(
  payload,
) {
  if (
    !payload ||
    typeof payload !==
      "object" ||
    Array.isArray(
      payload,
    )
  ) {
    return payload;
  }

  const {
    requestId:
      _requestId,
    ...representation
  } =
    payload;

  return representation;
}

function stableJsonEntity(
  payload,
) {
  const representation =
    cacheableRepresentation(
      payload,
    );
  const body =
    JSON.stringify(
      representation,
    );
  const etag =
    `"${crypto
      .createHash(
        "sha256",
      )
      .update(
        body,
      )
      .digest(
        "base64url",
      )}"`;

  return {
    representation,
    body,
    etag,
  };
}

function ifNoneMatchMatches(
  header,
  etag,
) {
  if (
    typeof header !==
      "string"
  ) {
    return false;
  }

  const normalizedEtag =
    etag.replace(
      /^W\//,
      "",
    );

  return header
    .split(",")
    .map(
      (value) =>
        value.trim(),
    )
    .some(
      (candidate) =>
        candidate ===
          "*" ||
        candidate.replace(
          /^W\//,
          "",
        ) ===
          normalizedEtag,
    );
}

function jsonCached(
  req,
  res,
  payload,
  {
    maxAge =
      300,
    staleWhileRevalidate =
      60,
  } = {},
) {
  const {
    representation,
    body,
    etag,
  } =
    stableJsonEntity(
      payload,
    );

  const cacheControl =
    `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;

  if (
    ifNoneMatchMatches(
      req.headers[
        "if-none-match"
      ],
      etag,
    )
  ) {
    res.writeHead(
      304,
      {
        ...commonHeaders(),
        "cache-control":
          cacheControl,
        etag,
      },
    );
    res.end();
    return;
  }

  res.writeHead(
    200,
    {
      ...commonHeaders(),
      "content-type":
        "application/json; charset=utf-8",
      "cache-control":
        cacheControl,
      etag,
    },
  );

  res.end(
    body,
  );

  return representation;
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

      const rateLimitKey =
        resolveRateLimitClientKey(
          req,
          {
            trustedProxyAddresses,
            maxForwardedHops:
              trustedProxyHops,
          },
        );
      const rate =
        checkRate(
          rateLimitKey,
        );

      res.setHeader(
        "x-request-id",
        id,
      );
      res.setHeader(
        "x-ratelimit-policy",
        `${apiRateLimit};w=60;burst=${apiRateBurst}`,
      );
      res.setHeader(
        "x-ratelimit-limit",
        String(rate.limit),
      );
      res.setHeader(
        "x-ratelimit-remaining",
        String(rate.remaining),
      );
      res.setHeader(
        "x-ratelimit-reset",
        String(
          Math.max(
            0,
            Math.ceil(
              (rate.resetAt - Date.now()) /
              1000,
            ),
          ),
        ),
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
                    rate.retryAfterMs /
                    1000,
                  ),
                ),
              ),
          },
        );
      }

      const url =
        new URL(
          req.url ?? "/",
          `http://${host}:${port}`,
        );


if (
  expensivePaths.has(
    url.pathname,
  )
) {
  const expensiveRate =
    checkExpensiveRate(
      rateLimitKey,
    );

  res.setHeader(
    "x-expensive-ratelimit-policy",
    `${expensiveApiRateLimit};w=60;burst=${expensiveApiRateBurst}`,
  );
  res.setHeader(
    "x-expensive-ratelimit-limit",
    String(
      expensiveRate.limit,
    ),
  );
  res.setHeader(
    "x-expensive-ratelimit-remaining",
    String(
      expensiveRate.remaining,
    ),
  );

  if (
    !expensiveRate.allowed
  ) {
    return errorResponse(
      res,
      429,
      "PWRC_EXPENSIVE_ROUTE_RATE_LIMITED",
      id,
      {
        "retry-after":
          String(
            Math.max(
              1,
              Math.ceil(
                (
                  expensiveRate.resetAt -
                  Date.now()
                ) /
                1000,
              ),
            ),
          ),
      },
    );
  }
}

      const isHead =
        req.method ===
          "HEAD";

      if (
        req.method !== "GET" &&
        !(
          isHead &&
          isCacheableHeadPath(
            url.pathname,
          )
        )
      ) {
        return errorResponse(
          res,
          405,
          "METHOD_NOT_ALLOWED",
          id,
          {
            allow:
              isCacheableHeadPath(
                url.pathname,
              )
                ? "GET, HEAD"
                : "GET",
          },
        );
      }

      if (isHead) {
        const end =
          res.end.bind(res);

        res.end =
          (
            _chunk,
            encoding,
            callback,
          ) =>
            end(
              undefined,
              encoding,
              callback,
            );
      }


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
<meta name="theme-color" content="#07142d">
<title>PowerChain Token API</title>
<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,sans-serif;--bg:#f6f8fb;--surface:#fff;--subtle:#f8fafc;--text:#0b1220;--muted:#64748b;--border:#e2e8f0;--strong:#cbd5e1;--accent:#2563eb;--navy:#07142d;--get:#166534;--shadow:0 14px 40px rgba(15,23,42,.07)}
:root[data-theme=dark]{color-scheme:dark;--bg:#070b13;--surface:#0d1420;--subtle:#111a28;--text:#edf3fb;--muted:#96a4b8;--border:#1e293b;--strong:#334155;--accent:#60a5fa;--navy:#e8f0fb;--get:#86efac;--shadow:0 16px 44px rgba(0,0,0,.28)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}button,input,select{font:inherit}a{color:inherit}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 28%,transparent);outline-offset:2px}
header{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--surface) 94%,transparent);border-bottom:1px solid var(--border);backdrop-filter:blur(14px)}.header{width:min(1180px,calc(100% - 32px));min-height:68px;margin:auto;display:flex;align-items:center;gap:14px}.brand{font-weight:850;letter-spacing:-.025em}.header-links{display:flex;gap:4px;margin-left:auto;align-items:center}.header-links a{font-size:13px;font-weight:700;color:var(--muted);text-decoration:none;padding:8px 10px;border-radius:8px}.header-links a:hover{color:var(--text);background:var(--subtle)}
.icon{width:40px;height:40px;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:10px;cursor:pointer}
main{width:min(1180px,calc(100% - 32px));margin:auto;padding:42px 0 72px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);font-weight:800}h1{font-size:clamp(36px,5vw,58px);line-height:1;letter-spacing:-.045em;margin:10px 0 12px}.lead{max-width:760px;color:var(--muted);font-size:17px;line-height:1.65}
.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:24px 0}.summary-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:15px}.summary-label{color:var(--muted);font-size:11px;font-weight:750}.summary-value{font-size:20px;font-weight:850;margin-top:4px}
.toolbar{position:sticky;top:81px;z-index:10;display:grid;grid-template-columns:minmax(0,1fr) 210px auto;gap:10px;padding:12px;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(12px);border:1px solid var(--border);border-radius:14px;margin:18px 0}.control{min-height:44px;border:1px solid var(--strong);border-radius:10px;background:var(--surface);color:var(--text);padding:0 12px}.clear{border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--muted);padding:0 14px;cursor:pointer;font-weight:700}.clear:hover{color:var(--text);border-color:var(--strong)}
.meta{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.pill{display:inline-flex;align-items:center;border:1px solid var(--border);background:var(--surface);border-radius:999px;padding:5px 9px;color:var(--muted);font-size:12px;font-weight:700}.route-list{display:grid;gap:10px}.route{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:17px;box-shadow:var(--shadow);display:grid;grid-template-columns:68px minmax(0,1fr) auto;gap:14px;align-items:start}.method{font-weight:900;color:var(--get);font-size:12px;letter-spacing:.04em;padding-top:4px}.path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:750;overflow-wrap:anywhere}.route-summary{font-size:14px;margin-top:7px}.route-meta{color:var(--muted);font-size:12px;margin-top:5px}.copy{border:1px solid var(--border);background:var(--subtle);color:var(--muted);border-radius:9px;padding:7px 9px;cursor:pointer;font-size:12px;font-weight:700}.copy:hover{color:var(--text);border-color:var(--strong)}.empty,.error{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;text-align:center;color:var(--muted)}.error{color:#b91c1c}
footer{border-top:1px solid var(--border);background:var(--surface)}.footer{width:min(1180px,calc(100% - 32px));margin:auto;padding:20px 0;color:var(--muted);font-size:12px}
@media(max-width:800px){.summary{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar{grid-template-columns:1fr 1fr}.clear{grid-column:1/-1;min-height:40px}.route{grid-template-columns:56px minmax(0,1fr)}.route .copy{grid-column:2;justify-self:start}.header-links a{display:none}}
@media(max-width:520px){main,.header,.footer{width:min(100% - 24px,1180px)}.summary{grid-template-columns:1fr 1fr}.toolbar{top:77px;grid-template-columns:1fr}.clear{grid-column:auto}.route{grid-template-columns:1fr}.method,.route .copy{grid-column:1}.toolbar{border-radius:12px}.summary-value{font-size:17px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
</head>
<body>
<header><div class="header"><div class="brand">PowerChain API</div><div class="header-links"><a href="/api/v1/token">Token</a><a href="/api/v1/assets">Assets</a><a href="/api/v1/openapi.json">OpenAPI JSON</a><a href="/swagger/openapi.yaml">YAML</a><button class="icon" id="theme" type="button" aria-label="Switch color theme">◐</button></div></div></header>
<main>
<div class="eyebrow">PowerChain 1.0.0 · OpenAPI 3.1</div>
<h1>Token API Explorer</h1>
<p class="lead">Browse the read-only PWRC/wPWRC API surface. Search by path, summary, tag or operation ID. No wallet signing, transaction submission, minting or administrative writes are exposed.</p>
<div class="summary">
<div class="summary-card"><div class="summary-label">API version</div><div class="summary-value">v1</div></div>
<div class="summary-card"><div class="summary-label">Public writes</div><div class="summary-value">0</div></div>
<div class="summary-card"><div class="summary-label">Canonical asset</div><div class="summary-value">PWRC</div></div>
<div class="summary-card"><div class="summary-label">Visible routes</div><div class="summary-value" id="count-value">—</div></div>
</div>
<div class="toolbar">
<input class="control" id="search" type="search" placeholder="Search endpoints…" aria-label="Search API endpoints">
<select class="control" id="tag" aria-label="Filter endpoints by tag"><option value="">All tags</option></select>
<button class="clear" id="clear" type="button">Clear filters</button>
</div>
<div class="meta"><span class="pill" id="count">Loading routes…</span><span class="pill">GET-only public surface</span><span class="pill">Policy-bound</span><span class="pill">No signing/submission</span></div>
<div class="route-list" id="routes" aria-live="polite"><div class="empty">Loading endpoint registry…</div></div>
</main>
<footer><div class="footer">PowerChain Token API 1.0.0 · Read-only explorer</div></footer>
<script>
const state={routes:[]},root=document.documentElement,$=s=>document.querySelector(s);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setTheme(theme){root.dataset.theme=theme;try{localStorage.setItem("powerchain.swagger.theme",theme)}catch{}$("#theme").textContent=theme==="dark"?"☀":"◐";$("#theme").setAttribute("aria-label",theme==="dark"?"Use light theme":"Use dark theme")}
let saved;try{saved=localStorage.getItem("powerchain.swagger.theme")}catch{}
setTheme(saved==="dark"||(!saved&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light");
$("#theme").onclick=()=>setTheme(root.dataset.theme==="dark"?"light":"dark");
function render(){
 const q=$("#search").value.trim().toLowerCase(),tag=$("#tag").value;
 const rows=state.routes.filter(e=>(!tag||e.tag===tag)&&(!q||[e.path,e.summary,e.tag,e.operationId].some(v=>String(v).toLowerCase().includes(q))));
 $("#count").textContent=rows.length+" of "+state.routes.length+" routes";$("#count-value").textContent=String(rows.length);
 $("#routes").innerHTML=rows.length?rows.map(e=>'<article class="route"><span class="method">'+esc(e.method)+'</span><div><div class="path">'+esc(e.path)+'</div><div class="route-summary">'+esc(e.summary)+'</div><div class="route-meta">'+esc(e.tag)+' · '+esc(e.operationId)+'</div></div><button class="copy" type="button" data-path="'+esc(e.path)+'">Copy path</button></article>').join(""):'<div class="empty">No endpoints match the current filters.</div>';
}
fetch("/api/v1",{headers:{accept:"application/json"}}).then(r=>{if(!r.ok)throw new Error("registry");return r.json()}).then(api=>{
 state.routes=api.endpoints||[];
 [...new Set(state.routes.map(e=>e.tag))].sort().forEach(tag=>{const o=document.createElement("option");o.value=tag;o.textContent=tag;$("#tag").appendChild(o)});
 render();
}).catch(()=>{$("#routes").innerHTML='<div class="error">Unable to load the endpoint registry.</div>';$("#count").textContent="Registry unavailable"});
$("#search").addEventListener("input",render);$("#tag").addEventListener("change",render);
$("#clear").onclick=()=>{$("#search").value="";$("#tag").value="";render();$("#search").focus()};
document.addEventListener("click",async e=>{const b=e.target.closest("[data-path]");if(!b)return;try{await navigator.clipboard.writeText(b.dataset.path);const t=b.textContent;b.textContent="Copied";setTimeout(()=>b.textContent=t,1000)}catch{b.textContent="Copy failed"}});
</script>
</body>
</html>`,
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
        return jsonCached(
          req,
          res,
          readOpenApiJson(),
          {
            maxAge:
              60,
          },
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
    "/api/v1/token/description"
) {
  return jsonCached(
    req,
    res,
    canonicalTokenDescription(),
    {
      maxAge:
        300,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/token/metadata"
) {
  return jsonCached(
    req,
    res,
    {
      ...publicMetadataState(),
      requestId:
        id,
    },
    {
      maxAge:
        300,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/token/fees"
) {
  return jsonCached(
    req,
    res,
    {
      ...publicFeePolicy(),
      requestId:
        id,
    },
    {
      maxAge:
        60,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/assets" ||
  url.pathname ===
    "/api/v1/assets/"
) {
  return jsonCached(
    req,
    res,
    {
      ...publicAssetRegistry(),
      requestId:
        id,
    },
    {
      maxAge:
        300,
    },
  );
}

if (
  url.pathname.startsWith(
    "/api/v1/assets/",
  ) &&
  url.pathname !==
    "/api/v1/assets/"
) {
  try {
    const symbol =
      decodeURIComponent(
        url.pathname.slice(
          "/api/v1/assets/".length,
        ),
      );

    if (
      symbol.includes(
        "/",
      )
    ) {
      return errorResponse(
        res,
        404,
        "PWRC_ASSET_NOT_FOUND",
        id,
      );
    }

    const asset =
      publicAssetBySymbol(
        symbol,
      );

    if (!asset) {
      return errorResponse(
        res,
        404,
        "PWRC_ASSET_NOT_FOUND",
        id,
      );
    }

    return jsonCached(
      req,
      res,
      {
        ...asset,
        requestId:
          id,
      },
      {
        maxAge:
          300,
      },
    );
  } catch (error) {
    return errorResponse(
      res,
      400,
      error instanceof Error
        ? error.message
        : "PWRC_ASSET_SYMBOL_INVALID",
      id,
    );
  }
}

if (
  url.pathname ===
    "/api/v1/token/transfer-policy"
) {
  return json(
    res,
    200,
    {
      ...nativeTransferRuntimePolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/token/utility-policy"
) {
  return json(
    res,
    200,
    {
      ...utilityRuntimePolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/token/native-verification"
) {
  try {
    return json(
      res,
      200,
      {
        ...nativePwrcVerificationConfig(),
        requestId:
          id,
      },
    );
  } catch (error) {
    return errorResponse(
      res,
      503,
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_VERIFICATION_CONFIG_UNAVAILABLE",
      id,
    );
  }
}

if (
  url.pathname ===
    "/api/v1/token/native-attestation"
) {
  try {
    return json(
      res,
      200,
      {
        ...await liveNativePwrcAttestation(),
        requestId:
          id,
      },
    );
  } catch (error) {
    return errorResponse(
      res,
      503,
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_ATTESTATION_UNAVAILABLE",
      id,
    );
  }
}

if (
  url.pathname ===
    "/api/v1/token/policy"
) {
  return jsonCached(
    req,
    res,
    {
      ...canonicalTokenPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/token/native-policy"
) {
  return jsonCached(
    req,
    res,
    {
      ...nativePwrcPolicy(),
      requestId:
        id,
    },
  );
}

      if (
        url.pathname ===
          "/api/v1/token" ||
        url.pathname ===
          "/api/v1/token/"
      ) {
        return jsonCached(
          req,
          res,
          {
            ...powerChainTokenApiIndex(),
            ...canonicalTokenProfile(),
            requestId:
              id,
          },
          {
            maxAge:
              300,
          },
        );
      }


      if (
        url.pathname ===
          "/api/v1/metadata"
      ) {
        return jsonCached(
          req,
          res,
          publicMetadataState(),
          {
            maxAge:
              300,
          },
        );
      }


if (
  url.pathname ===
    "/api/v1/integrations/helius/health"
) {
  try {
    return json(
      res,
      200,
      {
        ...await heliusHealth(),
        requestId:
          id,
      },
    );
  } catch (error) {
    return errorResponse(
      res,
      503,
      error instanceof Error
        ? error.message
        : "PWRC_HELIUS_HEALTH_UNAVAILABLE",
      id,
    );
  }
}

if (
  url.pathname ===
    "/api/v1/integrations/helius"
) {
  return json(
    res,
    200,
    {
      ...heliusConfigStatus(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/data/solana/pwrc/helius/asset"
) {
  try {
    return json(
      res,
      200,
      {
        version:
          "1.0.0",
        provider:
          "helius-das",
        asset:
          await heliusPwrcAsset(),
        requestId:
          id,
      },
    );
  } catch (error) {
    return errorResponse(
      res,
      503,
      error instanceof Error
        ? error.message
        : "PWRC_HELIUS_UNAVAILABLE",
      id,
    );
  }
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
              serviceRecipient:
                resolveServiceFeeRecipient(
                  operation,
                ),
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
                serviceRecipient:
                  resolveServiceFeeRecipient(
                    "bridge-solana-to-sui",
                  ),
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
    "/api/v1/bridge/quote/sui-to-solana"
) {
  try {
    return json(
      res,
      200,
      {
        ...quoteSuiToSolanaBridge({
          amountBaseUnits:
            url.searchParams.get(
              "amountBaseUnits",
            ),
          serviceEnabled,
          serviceBps,
          serviceRecipient:
            resolveServiceFeeRecipient(
              "bridge-sui-to-solana",
            ),
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
    "/api/v1/bridge/policy-config"
) {
  try {
    return json(
      res,
      200,
      {
        ...bridgePolicyConfigSurface(),
        requestId:
          id,
      },
    );
  } catch (error) {
    return errorResponse(
      res,
      503,
      error instanceof Error
        ? error.message
        : "PWRC_BRIDGE_POLICY_CONFIG_INVALID",
      id,
    );
  }
}

if (
  url.pathname ===
    "/api/v1/bridge/safety-policy"
) {
  return json(
    res,
    200,
    {
      ...bridgeSafetyPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/governance-policy"
) {
  return json(
    res,
    200,
    {
      ...bridgeGovernancePolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/risk-policy"
) {
  return json(
    res,
    200,
    {
      ...bridgeRiskPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/audit-policy"
) {
  return json(
    res,
    200,
    {
      ...bridgeAuditPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/recovery"
) {
  return json(
    res,
    200,
    {
      ...bridgeRecoveryPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/reconciliation"
) {
  return json(
    res,
    200,
    {
      ...bridgeReconciliationPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/plan"
) {
  return json(
    res,
    200,
    {
      ...bridgeExecutionPolicy(),
      requestId:
        id,
    },
  );
}

if (
  url.pathname ===
    "/api/v1/bridge/lifecycle"
) {
  return json(
    res,
    200,
    {
      ...bridgeLifecyclePolicy(),
      requestId:
        id,
    },
  );
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

installGracefulHttpShutdown(
  server,
  {
    component:
      "@powerchain/api",
  },
);
