import "dotenv/config";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {
  installGracefulHttpShutdown,
} from "../shared/graceful-http.mjs";

const host =
  process.env.PWRC_CLIENT_HOST ??
  "127.0.0.1";
const port =
  Number(
    process.env.PWRC_CLIENT_PORT ??
    "3000",
  );
const apiTarget =
  process.env.PWRC_CLIENT_API_URL ??
  "http://127.0.0.1:8787";

if (
  !Number.isSafeInteger(port) ||
  port < 1 ||
  port > 65_535
) {
  throw new Error(
    "PWRC_CLIENT_PORT_INVALID",
  );
}

const apiUrl =
  new URL(
    apiTarget,
  );

if (
  ![
    "http:",
    "https:",
  ].includes(
    apiUrl.protocol,
  )
) {
  throw new Error(
    "PWRC_CLIENT_API_URL_INVALID",
  );
}

const publicDir =
  path.resolve(
    "apps/client/public",
  );

const server =
  http.createServer(
    async (
      req,
      res,
    ) => {
      const url =
        new URL(
          req.url ?? "/",
          `http://${host}:${port}`,
        );

      if (
        url.pathname.startsWith(
          "/api/",
        )
      ) {
        try {
          const target =
            new URL(
              url.pathname +
              url.search,
              apiUrl,
            );

          const response =
            await fetch(
              target,
              {
                signal:
                  AbortSignal.timeout(
                    10_000,
                  ),
              },
            );

          const headers =
            Object.fromEntries(
              response.headers.entries(),
            );

          delete headers[
            "content-length"
          ];

          res.writeHead(
            response.status,
            headers,
          );
          res.end(
            Buffer.from(
              await response.arrayBuffer(),
            ),
          );
        } catch {
          res.writeHead(
            502,
            {
              "content-type":
                "application/json; charset=utf-8",
            },
          );
          res.end(
            JSON.stringify({
              error:
                "PWRC_CLIENT_API_PROXY_FAILED",
            }),
          );
        }

        return;
      }

      const file =
        url.pathname === "/"
          ? "index.html"
          : url.pathname.replace(
              /^\//,
              "",
            );

      const resolved =
        path.resolve(
          publicDir,
          file,
        );

      const relative =
        path.relative(
          publicDir,
          resolved,
        );

      if (
        relative.startsWith(
          "..",
        ) ||
        path.isAbsolute(
          relative,
        ) ||
        !fs.existsSync(
          resolved,
        ) ||
        !fs.statSync(
          resolved,
        ).isFile()
      ) {
        res.writeHead(
          404,
          {
            "content-type":
              "text/plain; charset=utf-8",
            "x-content-type-options":
              "nosniff",
          },
        );
        res.end(
          "Not found",
        );
        return;
      }

      const type =
        resolved.endsWith(
          ".js",
        )
          ? "text/javascript; charset=utf-8"
          : resolved.endsWith(
                ".css",
              )
            ? "text/css; charset=utf-8"
            : "text/html; charset=utf-8";

      res.writeHead(
        200,
        {
          "content-type":
            type,
          "x-content-type-options":
            "nosniff",
          "referrer-policy":
            "no-referrer",
        },
      );

      fs.createReadStream(
        resolved,
      ).pipe(res);
    },
  );

server.on(
  "error",
  (error) => {
    process.stderr.write(
      `PWRC_CLIENT_LISTEN_ERROR:${error.code ?? "UNKNOWN"}:${host}:${port}\n`,
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
          "@powerchain/client",
        message:
          "client_started",
        host,
        port,
        apiTarget:
          apiUrl.toString(),
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
      "@powerchain/client",
  },
);
