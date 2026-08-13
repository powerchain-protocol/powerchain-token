import {
  fileURLToPath,
} from "node:url";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {
  readEnv,
  readSafeIntegerEnv,
} from "../../packages/runtime/src/env.mjs";
import {
  createLogger,
} from "../../packages/runtime/src/logger.mjs";
import {
  renderDocsShell,
} from "../../packages/docs-ui/src/index.mjs";
import {
  docsSessions,
  getDocsSession,
} from "../../packages/docs-content/src/index.mjs";

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
    "PWRC_DOCS_HOST",
  ) ??
  "127.0.0.1";

const port =
  readSafeIntegerEnv(
    process.env,
    "PWRC_DOCS_PORT",
    {
      min: 1,
      max: 65_535,
    },
  ) ??
  3002;

const publicRoot =
  path.resolve(
    "apps/docs/public",
  );

const logger =
  createLogger({
    component:
      "@powerchain/docs",
  });

const types = {
  ".css":
    "text/css; charset=utf-8",
  ".js":
    "text/javascript; charset=utf-8",
  ".svg":
    "image/svg+xml",
  ".png":
    "image/png",
};

function send(
  response,
  status,
  body,
  contentType,
) {
  response.writeHead(
    status,
    {
      "Content-Type":
        contentType,
      "Cache-Control":
        status === 200
          ? "no-store"
          : "no-store",
      "Content-Security-Policy":
        "default-src 'self'; connect-src 'self'; img-src 'self' data: https:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
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

  response.end(
    body,
  );
}

function serveAsset(
  pathname,
  response,
) {
  const relative =
    pathname
      .replace(
        /^\/assets\/+/,
        "",
      );

  const file =
    path.resolve(
      publicRoot,
      relative,
    );

  if (
    !file.startsWith(
      `${publicRoot}${path.sep}`,
    ) ||
    !fs.existsSync(
      file,
    ) ||
    !fs.statSync(
      file,
    ).isFile()
  ) {
    return false;
  }

  const type =
    types[
      path.extname(file)
        .toLowerCase()
    ] ??
    "application/octet-stream";

  response.writeHead(
    200,
    {
      "Content-Type":
        type,
      "Cache-Control":
        "public, max-age=300",
      "X-Content-Type-Options":
        "nosniff",
    },
  );

  fs.createReadStream(
    file,
  ).pipe(
    response,
  );

  return true;
}

const server =
  http.createServer(
    (request, response) => {
      try {
        const method =
          request.method ??
          "GET";

        if (
          method !== "GET" &&
          method !== "HEAD"
        ) {
          response.writeHead(
            405,
            {
              Allow:
                "GET, HEAD",
            },
          );
          response.end();
          return;
        }

        const url =
          new URL(
            request.url ?? "/",
            `http://${host}:${port}`,
          );

        if (
          url.pathname ===
            "/health"
        ) {
          send(
            response,
            200,
            JSON.stringify({
              ok: true,
              version:
                "1.0.0",
              app:
                "@powerchain/docs",
            }) + "\n",
            "application/json; charset=utf-8",
          );
          return;
        }

        if (
          url.pathname ===
            "/api/docs/sessions"
        ) {
          send(
            response,
            200,
            JSON.stringify({
              ok: true,
              version:
                "1.0.0",
              sessions:
                docsSessions.map(
                  ({
                    slug,
                    title,
                    description,
                    category,
                  }) => ({
                    slug,
                    title,
                    description,
                    category,
                  }),
                ),
            }) + "\n",
            "application/json; charset=utf-8",
          );
          return;
        }

        if (
          url.pathname.startsWith(
            "/assets/",
          ) &&
          serveAsset(
            url.pathname,
            response,
          )
        ) {
          return;
        }

        const slug =
          url.pathname === "/"
            ? "technology"
            : url.pathname
                .replace(
                  /^\/+/,
                  "",
                )
                .replace(
                  /\/+$/,
                  "",
                );

        const session =
          getDocsSession(
            slug,
          );

        if (!session) {
          send(
            response,
            404,
            "Documentation page not found\n",
            "text/plain; charset=utf-8",
          );
          return;
        }

        send(
          response,
          200,
          renderDocsShell({
            session,
            sessions:
              docsSessions,
          }),
          "text/html; charset=utf-8",
        );
      } catch (error) {
        logger.error(
          "docs_request_failed",
          error,
        );

        if (
          !response.headersSent
        ) {
          response.writeHead(
            500,
          );
        }

        response.end(
          "Internal documentation server error\n",
        );
      }
    },
  );

server.requestTimeout =
  30_000;
server.headersTimeout =
  10_000;
server.keepAliveTimeout =
  5_000;

server.on(
  "error",
  (error) => {
    const code =
      error &&
      typeof error ===
        "object" &&
      "code" in error
        ? String(
            error.code,
          )
        : "UNKNOWN";

    logger.error(
      "server_listen_failed",
      error,
      {
        host,
        port,
        code,
      },
    );

    if (
      code ===
        "EADDRINUSE"
    ) {
      console.error(
        `PWRC_SERVER_LISTEN_ERROR:docs:EADDRINUSE:${host}:${port}`,
      );
    }

    process.exitCode = 1;
  },
);

server.listen(
  port,
  host,
  () => {
    logger.info(
      "docs_started",
      {
        host,
        port,
        version:
          "1.0.0",
      },
    );
  },
);
