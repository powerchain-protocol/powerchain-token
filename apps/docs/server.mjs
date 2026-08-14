import "dotenv/config";
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
<title>PowerChain Docs</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;background:#f7f8f7;color:#111}
body{margin:0}header,footer{background:#fff;border-bottom:1px solid #ddd;padding:18px}
main{max-width:900px;margin:auto;padding:40px 20px}
button{background:#174d36;color:#fff;border:0;border-radius:10px;padding:10px 14px}
.dark{background:#101813;color:#e8efe9}.dark header,.dark footer{background:#152119;border-color:#25372b}
code{overflow-wrap:anywhere}
</style>
</head>
<body>
<header><strong>PowerChain 1.0.0 Technical Docs</strong> <button id="theme" type="button">Toggle theme</button></header>
<main>
<h1>PWRC</h1>
<p>Canonical Solana Token-2022 token and Sui wPWRC bridge representation.</p>
<h2>Canonical mint</h2>
<code>PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc</code>
<h2>Metaplex Token Metadata</h2>
<code>metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s</code>
<h2>Fees</h2>
<p>Native PWRC Token-2022 fee: 2.5% capped at 1,000,000 PWRC. PowerChain service fees are separate operation-level fees and disabled until explicitly configured.</p>
</main>
<footer>PowerChain 1.0.0 Technical Docs.</footer>
<script>document.querySelector("#theme").onclick=()=>document.body.classList.toggle("dark")</script>
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
