import "dotenv/config";
process.env.WS_NO_UTF_8_VALIDATE ??= "1";
import http from "node:http";
import {
  installGracefulHttpShutdown,
} from "../shared/graceful-http.mjs";

const host =
  process.env.PWRC_DOCS_HOST ??
  "127.0.0.1";
const port =
  Number(
    process.env.PWRC_DOCS_PORT ??
    "3002",
  );

if (
  !Number.isSafeInteger(port) ||
  port < 1 ||
  port > 65_535
) {
  throw new Error(
    "PWRC_DOCS_PORT_INVALID",
  );
}

const html =
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#07142d">
<title>PowerChain Technical Docs</title>
<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,sans-serif;--bg:#f6f8fb;--surface:#fff;--subtle:#f8fafc;--text:#0b1220;--muted:#64748b;--border:#e2e8f0;--accent:#2563eb;--navy:#07142d}
:root[data-theme=dark]{color-scheme:dark;--bg:#070b13;--surface:#0d1420;--subtle:#111a28;--text:#edf3fb;--muted:#96a4b8;--border:#1e293b;--accent:#60a5fa;--navy:#eff6ff}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text)}
header{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--surface) 94%,transparent);border-bottom:1px solid var(--border);backdrop-filter:blur(14px)}
.header{width:min(1100px,calc(100% - 32px));min-height:66px;margin:auto;display:flex;align-items:center;gap:16px}.brand{font-weight:850;letter-spacing:-.02em}.nav{margin-left:auto;display:flex;gap:5px;align-items:center}.nav a{color:var(--muted);text-decoration:none;padding:8px 10px;border-radius:8px;font-size:14px;font-weight:650}.nav a:hover{background:var(--subtle);color:var(--text)}
button{width:40px;height:40px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);cursor:pointer}
.layout{width:min(1100px,calc(100% - 32px));margin:auto;display:grid;grid-template-columns:220px minmax(0,1fr);gap:34px;padding:36px 0 68px}
aside{position:sticky;top:102px;align-self:start}.side-title{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:800;margin:0 0 8px}.side a{display:block;text-decoration:none;color:var(--muted);font-size:14px;padding:7px 9px;border-radius:8px}.side a:hover{background:var(--subtle);color:var(--text)}
main{min-width:0}h1{font-size:clamp(38px,6vw,62px);line-height:1;letter-spacing:-.045em;margin:5px 0 14px}h2{margin-top:38px;letter-spacing:-.025em}p{line-height:1.7;color:var(--muted)}.lead{font-size:18px;max-width:720px}.eyebrow{color:var(--accent);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;margin:14px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.label{font-size:12px;color:var(--muted);font-weight:750;margin-bottom:6px}.value{font-weight:800;overflow-wrap:anywhere}
code{overflow-wrap:anywhere;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}.code{background:var(--subtle);border:1px solid var(--border);border-radius:12px;padding:13px 14px;display:block}.pill{display:inline-flex;border:1px solid var(--border);background:var(--subtle);border-radius:999px;padding:4px 8px;color:var(--muted);font-size:12px;font-weight:700}
footer{border-top:1px solid var(--border);background:var(--surface)}.footer{width:min(1100px,calc(100% - 32px));margin:auto;padding:20px 0;color:var(--muted);font-size:13px}
@media(max-width:760px){.layout{grid-template-columns:1fr}.side{display:none}.nav a{display:none}.grid{grid-template-columns:1fr}.layout,.header,.footer{width:min(100% - 24px,1100px)}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
</head>
<body>
<header><div class="header"><div class="brand">PowerChain Docs</div><nav class="nav" aria-label="Documentation navigation"><a href="#token">Token</a><a href="#fees">Fees</a><a href="#api">API</a><button id="theme" type="button" aria-label="Switch color theme">◐</button></nav></div></header>
<div class="layout">
<aside class="side" aria-label="On this page">
<div class="side-title">Technical reference</div>
<a href="#token">PWRC</a>
<a href="#identity">Canonical identity</a>
<a href="#fees">Transfer fees</a>
<a href="#wrapped">wPWRC</a>
<a href="#api">API</a>
<a href="#release">Release state</a>
</aside>
<main>
<div class="eyebrow">PowerChain 1.0.0 · Technical documentation</div>
<h1 id="token">PWRC</h1>
<p class="lead">Canonical Solana Token-2022 asset with a fixed supply and a 1:1 wrapped representation on Sui. This runtime documentation is read-only and does not imply Mainnet deployment.</p>

<h2 id="identity">Canonical identity</h2>
<div class="grid">
<div class="card"><div class="label">Name / symbol</div><div class="value">PowerChain · PWRC</div></div>
<div class="card"><div class="label">Standard</div><div class="value">Solana Token-2022</div></div>
<div class="card"><div class="label">Decimals</div><div class="value">9</div></div>
<div class="card"><div class="label">Fixed supply</div><div class="value">18,446,000,000 PWRC</div></div>
</div>
<div class="card"><div class="label">Canonical mint</div><code class="code">PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc</code></div>
<div class="card"><div class="label">Token-2022 extensions</div><span class="pill">TransferFeeConfig</span> <span class="pill">MetadataPointer</span> <span class="pill">TokenMetadata</span></div>

<h2 id="fees">Transfer fees</h2>
<p>The canonical native Token-2022 transfer fee is <strong>2.5%</strong>, capped at <strong>1,000,000 PWRC</strong>. PowerChain service fees are separate operation-level fees and remain disabled until explicitly configured.</p>

<h2 id="wrapped">Wrapped PowerChain</h2>
<div class="card"><div class="label">wPWRC</div><div class="value">Sui mainnet · 9 decimals · zero genesis wrapped supply · 1:1 base-unit accounting</div></div>

<h2 id="api">API</h2>
<p>Canonical token and asset endpoints are read-only.</p>
<code class="code">GET /api/v1/token<br>GET /api/v1/token/policy<br>GET /api/v1/token/metadata<br>GET /api/v1/token/fees<br>GET /api/v1/assets<br>GET /api/v1/assets/{symbol}</code>

<h2 id="release">Release state</h2>
<p><strong>SOURCE_READY</strong> means source and policy gates are ready for the next release steps. It does not mean the Solana programs or Sui package are built, deployed, attested, or authorized for Mainnet.</p>
</main>
</div>
<footer><div class="footer">PowerChain 1.0.0 · Technical Docs · Read-only runtime reference</div></footer>
<script>
const root=document.documentElement,button=document.querySelector("#theme");
function setTheme(theme){root.dataset.theme=theme;try{localStorage.setItem("powerchain.docs.theme",theme)}catch{}button.textContent=theme==="dark"?"☀":"◐";button.setAttribute("aria-label",theme==="dark"?"Use light theme":"Use dark theme")}
let saved;try{saved=localStorage.getItem("powerchain.docs.theme")}catch{}
setTheme(saved==="dark"||(!saved&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light");
button.onclick=()=>setTheme(root.dataset.theme==="dark"?"light":"dark");
</script>
</body>
</html>`;

function headers(
  contentType,
) {
  return {
    "content-type":
      contentType,
    "cache-control":
      "no-store",
    "x-content-type-options":
      "nosniff",
    "x-frame-options":
      "DENY",
    "referrer-policy":
      "no-referrer",
    "content-security-policy":
      "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'",
  };
}

const server =
  http.createServer(
    (
      req,
      res,
    ) => {
      if (
        req.method !== "GET"
      ) {
        res.writeHead(
          405,
          {
            ...headers(
              "application/json; charset=utf-8",
            ),
            allow:
              "GET",
          },
        );
        res.end(
          JSON.stringify({
            error:
              "METHOD_NOT_ALLOWED",
          }),
        );
        return;
      }

      const url =
        new URL(
          req.url ?? "/",
          `http://${host}:${port}`,
        );

      if (
        url.pathname === "/health" ||
        url.pathname === "/ready"
      ) {
        res.writeHead(
          200,
          headers(
            "application/json; charset=utf-8",
          ),
        );
        res.end(
          JSON.stringify({
            ok:
              true,
            ready:
              true,
            version:
              "1.0.0",
          }),
        );
        return;
      }

      if (
        url.pathname !== "/"
      ) {
        res.writeHead(
          404,
          headers(
            "application/json; charset=utf-8",
          ),
        );
        res.end(
          JSON.stringify({
            error:
              "NOT_FOUND",
          }),
        );
        return;
      }

      res.writeHead(
        200,
        headers(
          "text/html; charset=utf-8",
        ),
      );
      res.end(html);
    },
  );

server.on(
  "error",
  (error) => {
    process.stderr.write(
      `PWRC_DOCS_LISTEN_ERROR:${error.code ?? "UNKNOWN"}:${host}:${port}\n`,
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
          "@powerchain/docs",
        message:
          "docs_started",
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
      "@powerchain/docs",
  },
);
