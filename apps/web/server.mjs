import { fileURLToPath } from "node:url";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {
  readEnv,
  readSafeIntegerEnv,
} from "../../utils/env.mjs";
import {
  createLogger,
} from "../../utils/logger.mjs";

const REPOSITORY_ROOT =
  fileURLToPath(
    new URL(
      "../..",
      import.meta.url,
    ),
  );

process.chdir(
  REPOSITORY_ROOT,
);

const host =
  readEnv(
    process.env,
    "PWRC_WEB_HOST",
  ) ??
  "127.0.0.1";

const port =
  readSafeIntegerEnv(
    process.env,
    "PWRC_WEB_PORT",
    {
      min: 1,
      max: 65_535,
    },
  ) ??
  3000;

const apiTargetRaw =
  readEnv(
    process.env,
    "PWRC_WEB_API_URL",
  ) ??
  "http://127.0.0.1:8787";

let apiTarget;

try {
  const parsed =
    new URL(
      apiTargetRaw,
    );

  const local =
    parsed.hostname ===
      "127.0.0.1" ||
    parsed.hostname ===
      "localhost";

  if (
    parsed.protocol !==
      "https:" &&
    !(
      local &&
      parsed.protocol ===
        "http:"
    )
  ) {
    throw new Error(
      "PWRC_WEB_API_URL_INSECURE",
    );
  }

  if (
    parsed.username ||
    parsed.password ||
    parsed.hash
  ) {
    throw new Error(
      "PWRC_WEB_API_URL_CREDENTIALS_FORBIDDEN",
    );
  }

  apiTarget =
    parsed
      .toString()
      .replace(
        /\/$/,
        "",
      );
} catch (error) {
  throw new Error(
    "PWRC_WEB_API_URL_INVALID",
    {
      cause: error,
    },
  );
}

const publicRoot =
  path.resolve(
    "apps/web/public",
  );

const logger =
  createLogger({
    component:
      "@powerchain/web",
  });

const TYPES = {
  ".html":
    "text/html; charset=utf-8",
  ".js":
    "text/javascript; charset=utf-8",
  ".css":
    "text/css; charset=utf-8",
  ".json":
    "application/json; charset=utf-8",
  ".svg":
    "image/svg+xml",
  ".png":
    "image/png",
};

function safeFile(
  pathname,
) {
  const relative =
    pathname === "/"
      ? "index.html"
      : pathname
          .replace(
            /^\/+/,
            "",
          );

  const file =
    path.resolve(
      publicRoot,
      relative,
    );

  if (
    file !== publicRoot &&
    !file.startsWith(
      `${publicRoot}${path.sep}`,
    )
  ) {
    return null;
  }

  return file;
}

async function proxyApi(
  request,
  response,
  url,
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      30_000,
    );

  try {
    const headers = {
      "Accept":
        "application/json",
    };

    if (
      typeof request.headers[
        "content-type"
      ] === "string"
    ) {
      headers[
        "Content-Type"
      ] =
        request.headers[
          "content-type"
        ];
    }

    if (
      typeof request.headers[
        "x-request-id"
      ] === "string"
    ) {
      headers[
        "X-Request-Id"
      ] =
        request.headers[
          "x-request-id"
        ];
    }

    let body;

    if (
      request.method !==
        "GET" &&
      request.method !==
        "HEAD"
    ) {
      const chunks = [];
      let size = 0;

      for await (
        const chunk of request
      ) {
        size +=
          chunk.length;

        if (
          size >
          64 * 1024
        ) {
          response.writeHead(
            413,
            {
              "Content-Type":
                "application/json; charset=utf-8",
            },
          );
          response.end(
            '{"ok":false,"error":{"code":"PWRC_WEB_PROXY_BODY_TOO_LARGE"}}\n',
          );
          return;
        }

        chunks.push(chunk);
      }

      body =
        Buffer.concat(
          chunks,
        );
    }

    const upstream =
      await fetch(
        `${apiTarget}${url.pathname}${url.search}`,
        {
          method:
            request.method,
          headers,
          body,
          redirect:
            "error",
          signal:
            controller.signal,
        },
      );

    const payload =
      Buffer.from(
        await upstream
          .arrayBuffer(),
      );

    const responseHeaders = {
      "Cache-Control":
        "no-store",
      "Content-Type":
        upstream.headers.get(
          "content-type",
        ) ??
        "application/json; charset=utf-8",
      "Referrer-Policy":
        "no-referrer",
      "X-Content-Type-Options":
        "nosniff",
      "X-Frame-Options":
        "DENY",
    };

    const upstreamRequestId =
      upstream.headers.get(
        "x-request-id",
      );

    if (upstreamRequestId) {
      responseHeaders[
        "X-Request-Id"
      ] =
        upstreamRequestId;
    }

    response.writeHead(
      upstream.status,
      responseHeaders,
    );

    response.end(
      payload,
    );
  } catch (error) {
    logger.error(
      "api_proxy_failed",
      error,
      {
        path:
          url.pathname,
      },
    );

    response.writeHead(
      error?.name ===
        "AbortError"
        ? 504
        : 502,
      {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store",
        "X-Content-Type-Options":
          "nosniff",
      },
    );

    response.end(
      JSON.stringify({
        ok: false,
        version: "1.0.0",
        error: {
          code:
            error?.name ===
              "AbortError"
              ? "PWRC_WEB_PROXY_TIMEOUT"
              : "PWRC_WEB_PROXY_UNAVAILABLE",
        },
      }) + "\n",
    );
  } finally {
    clearTimeout(
      timeout,
    );
  }
}

const server =
  http.createServer(
    (request, response) => {
      void (async () => {
        try {
          const url =
            new URL(
              request.url ?? "/",
              `http://${host}:${port}`,
            );

          if (
            url.pathname.startsWith(
              "/api/",
            )
          ) {
            await proxyApi(
              request,
              response,
              url,
            );
            return;
          }

          if (
            request.method !==
            "GET"
          ) {
            response.writeHead(
              405,
              {
                "Allow": "GET",
                "X-Content-Type-Options":
                  "nosniff",
              },
            );
            response.end();
            return;
          }

          const file =
            safeFile(
              url.pathname,
            );

          if (
            !file ||
            !fs.existsSync(file) ||
            !fs.statSync(file)
              .isFile()
          ) {
            response.writeHead(
              404,
              {
                "Content-Type":
                  "text/plain; charset=utf-8",
                "X-Content-Type-Options":
                  "nosniff",
              },
            );
            response.end(
              "Not found\n",
            );
            return;
          }

          const type =
            TYPES[
              path.extname(file)
                .toLowerCase()
            ] ??
            "application/octet-stream";

          response.writeHead(
            200,
            {
              "Cache-Control":
                path.basename(
                  file,
                ) ===
                  "index.html"
                  ? "no-store"
                  : "public, max-age=300",
              "Content-Security-Policy":
                "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
              "Content-Type":
                type,
              "Cross-Origin-Opener-Policy":
                "same-origin",
              "Referrer-Policy":
                "no-referrer",
              "X-Content-Type-Options":
                "nosniff",
              "X-Frame-Options":
                "DENY",
            },
          );

          fs.createReadStream(
            file,
          ).pipe(response);
        } catch (error) {
          logger.error(
            "web_request_failed",
            error,
          );

          if (
            !response.headersSent
          ) {
            response.writeHead(
              500,
            );
          }

          response.end();
        }
      })();
    },
  );

server.requestTimeout =
  30_000;
server.headersTimeout =
  10_000;
server.keepAliveTimeout =
  5_000;

server.listen(
  port,
  host,
  () => {
    logger.info(
      "web_started",
      {
        host,
        port,
        apiTarget,
        version:
          "1.0.0",
      },
    );
  },
);
