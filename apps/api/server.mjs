import {
  fileURLToPath,
} from "node:url";
import crypto from "node:crypto";
import http from "node:http";
import {
  readEnv,
  readSafeIntegerEnv,
} from "../../utils/env.mjs";
import {
  createLogger,
} from "../../utils/logger.mjs";
import {
  canonicalJsonSha256,
} from "../../utils/crypto.mjs";
import {
  healthSnapshot,
  quoteBridge,
  readinessSnapshot,
  refreshMainnetStatus,
  tokenProfile,
} from "./lib/platform.mjs";
import {
  executorCapability,
  submitBridgeExecution,
} from "./lib/executor.mjs";
import {
  publicError,
  readJsonBody,
  requestId,
  sendJson,
} from "./lib/http.mjs";
import {
  FixedWindowRateLimiter,
  clientRateLimitKey,
} from "./lib/rate-limit.mjs";
import {
  incrementMetric,
  metricsSnapshot,
} from "./lib/metrics.mjs";
import {
  FileExecutionIdempotencyStore,
} from "./lib/idempotency.mjs";
import {
  validateExecutionRequest,
} from "./lib/bridge-request.mjs";

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

const logger =
  createLogger({
    component:
      "@powerchain/api",
  });

const host =
  readEnv(
    process.env,
    "PWRC_API_HOST",
  ) ??
  "127.0.0.1";

const port =
  readSafeIntegerEnv(
    process.env,
    "PWRC_API_PORT",
    {
      min: 1,
      max: 65_535,
    },
  ) ??
  8787;

const allowedOrigin =
  readEnv(
    process.env,
    "PWRC_API_ALLOWED_ORIGIN",
  );

const readRateLimit =
  readSafeIntegerEnv(
    process.env,
    "PWRC_API_READ_RATE_LIMIT_PER_MINUTE",
    {
      min: 1,
      max: 100_000,
    },
  ) ??
  120;

const writeRateLimit =
  readSafeIntegerEnv(
    process.env,
    "PWRC_API_WRITE_RATE_LIMIT_PER_MINUTE",
    {
      min: 1,
      max: 100_000,
    },
  ) ??
  30;

const readLimiter =
  new FixedWindowRateLimiter({
    limit:
      readRateLimit,
    windowMs:
      60_000,
  });

const writeLimiter =
  new FixedWindowRateLimiter({
    limit:
      writeRateLimit,
    windowMs:
      60_000,
  });

const idempotencyStore =
  new FileExecutionIdempotencyStore({
    directory:
      readEnv(
        process.env,
        "PWRC_API_IDEMPOTENCY_DIR",
      ) ??
      "runtime/api-idempotency",
  });

const KNOWN_PATHS =
  new Map([
    [
      "/api/v1/health",
      new Set(["GET"]),
    ],
    [
      "/api/v1/ready",
      new Set(["GET"]),
    ],
    [
      "/api/v1/version",
      new Set(["GET"]),
    ],
    [
      "/api/v1/token",
      new Set(["GET"]),
    ],
    [
      "/api/v1/metrics",
      new Set(["GET"]),
    ],
    [
      "/api/v1/mainnet/status",
      new Set(["GET"]),
    ],
    [
      "/api/v1/bridge/capabilities",
      new Set(["GET"]),
    ],
    [
      "/api/v1/bridge/quote",
      new Set(["POST"]),
    ],
    [
      "/api/v1/bridge/execute",
      new Set(["POST"]),
    ],
  ]);

function constantTimeTokenEqual(
  provided,
  expected,
) {
  if (
    typeof provided !==
      "string" ||
    typeof expected !==
      "string"
  ) {
    return false;
  }

  const left =
    Buffer.from(
      provided,
      "utf8",
    );

  const right =
    Buffer.from(
      expected,
      "utf8",
    );

  if (
    left.length !==
      right.length
  ) {
    return false;
  }

  return crypto
    .timingSafeEqual(
      left,
      right,
    );
}

function requireExecutionAuthorization(
  request,
) {
  const expected =
    readEnv(
      process.env,
      "PWRC_BRIDGE_API_AUTH_TOKEN",
    );

  if (!expected) {
    const error =
      new Error(
        "PWRC_BRIDGE_API_AUTH_NOT_CONFIGURED",
      );
    error.statusCode =
      503;
    throw error;
  }

  const authorization =
    request.headers
      .authorization;

  const prefix =
    "Bearer ";

  const provided =
    typeof authorization ===
      "string" &&
    authorization.startsWith(
      prefix,
    )
      ? authorization.slice(
          prefix.length,
        )
      : "";

  if (
    !constantTimeTokenEqual(
      provided,
      expected,
    )
  ) {
    const error =
      new Error(
        "PWRC_BRIDGE_EXECUTION_UNAUTHORIZED",
      );
    error.statusCode =
      401;
    throw error;
  }
}

function requireIdempotencyKey(
  request,
) {
  const value =
    request.headers[
      "idempotency-key"
    ];

  if (
    typeof value !==
      "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(
      value,
    )
  ) {
    const error =
      new Error(
        "PWRC_IDEMPOTENCY_KEY_REQUIRED",
      );
    error.statusCode =
      400;
    throw error;
  }

  return value;
}

function parseRoute(
  request,
) {
  const url =
    new URL(
      request.url ?? "/",
      `http://${host}:${port}`,
    );

  return {
    method:
      request.method ??
      "GET",
    pathname:
      url.pathname,
    url,
  };
}

function rateLimitContext(
  request,
  method,
) {
  const write =
    method !== "GET" &&
    method !== "HEAD" &&
    method !== "OPTIONS";

  const result =
    (
      write
        ? writeLimiter
        : readLimiter
    ).consume(
      clientRateLimitKey(
        request,
      ),
    );

  return {
    allowed:
      result.allowed,
    headers: {
      "RateLimit-Limit":
        String(
          result.limit,
        ),
      "RateLimit-Remaining":
        String(
          result.remaining,
        ),
      "RateLimit-Reset":
        String(
          Math.ceil(
            result.resetAt /
              1000,
          ),
        ),
    },
  };
}

function executionStatusPath(
  pathname,
) {
  const prefix =
    "/api/v1/bridge/executions/";

  if (
    !pathname.startsWith(
      prefix,
    )
  ) {
    return null;
  }

  const encoded =
    pathname.slice(
      prefix.length,
    );

  if (!encoded) {
    return null;
  }

  try {
    const key =
      decodeURIComponent(
        encoded,
      );

    if (
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(
        key,
      )
    ) {
      return null;
    }

    return key;
  } catch {
    return null;
  }
}

async function handle(
  request,
  response,
) {
  const id =
    requestId(request);

  const origin =
    typeof request.headers
      .origin ===
      "string"
      ? request.headers.origin
      : undefined;

  const route =
    parseRoute(request);

  const rate =
    rateLimitContext(
      request,
      route.method,
    );

  const context = {
    requestId:
      id,
    origin,
    allowedOrigin,
    extraHeaders:
      rate.headers,
  };

  incrementMetric(
    "http.requests",
  );

  try {
    if (!rate.allowed) {
      incrementMetric(
        "http.rate_limited",
      );

      sendJson(
        response,
        429,
        {
          ok: false,
          version:
            "1.0.0",
          error: {
            code:
              "PWRC_RATE_LIMIT_EXCEEDED",
            requestId:
              id,
          },
        },
        context,
      );
      return;
    }

    if (
      route.method ===
      "OPTIONS"
    ) {
      if (
        !allowedOrigin ||
        origin !==
          allowedOrigin
      ) {
        sendJson(
          response,
          403,
          {
            ok: false,
            version:
              "1.0.0",
            error: {
              code:
                "PWRC_CORS_ORIGIN_FORBIDDEN",
              requestId:
                id,
            },
          },
          context,
        );
        return;
      }

      response.writeHead(
        204,
        {
          "Access-Control-Allow-Origin":
            allowedOrigin,
          "Access-Control-Allow-Methods":
            "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Request-Id",
          "Access-Control-Max-Age":
            "600",
          "Vary":
            "Origin",
          "X-Request-Id":
            id,
          ...rate.headers,
        },
      );
      response.end();
      return;
    }

    const statusKey =
      executionStatusPath(
        route.pathname,
      );

    if (
      statusKey &&
      route.method ===
        "GET"
    ) {
      requireExecutionAuthorization(
        request,
      );

      const record =
        idempotencyStore.read(
          statusKey,
        );

      if (!record) {
        sendJson(
          response,
          404,
          {
            ok: false,
            version:
              "1.0.0",
            error: {
              code:
                "PWRC_EXECUTION_RECORD_NOT_FOUND",
              requestId:
                id,
            },
          },
          context,
        );
        return;
      }

      sendJson(
        response,
        200,
        {
          ok: true,
          version:
            "1.0.0",
          execution:
            record,
        },
        context,
      );
      return;
    }

    const methods =
      KNOWN_PATHS.get(
        route.pathname,
      );

    if (
      methods &&
      !methods.has(
        route.method,
      )
    ) {
      sendJson(
        response,
        405,
        {
          ok: false,
          version:
            "1.0.0",
          error: {
            code:
              "PWRC_HTTP_METHOD_NOT_ALLOWED",
            requestId:
              id,
          },
        },
        {
          ...context,
          extraHeaders: {
            ...rate.headers,
            "Allow":
              [...methods]
                .join(", "),
          },
        },
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/health"
    ) {
      incrementMetric(
        "route.health",
      );
      sendJson(
        response,
        200,
        healthSnapshot(),
        context,
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/ready"
    ) {
      incrementMetric(
        "route.ready",
      );

      const ready =
        readinessSnapshot();

      sendJson(
        response,
        ready.codeReady
          ? 200
          : 503,
        ready,
        context,
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/version"
    ) {
      sendJson(
        response,
        200,
        {
          ok: true,
          version:
            "1.0.0",
          apiVersion:
            "v1",
        },
        context,
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/token"
    ) {
      incrementMetric(
        "route.token",
      );

      sendJson(
        response,
        200,
        {
          ok: true,
          token:
            tokenProfile(),
        },
        context,
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/metrics"
    ) {
      sendJson(
        response,
        200,
        {
          ok: true,
          ...metricsSnapshot(),
        },
        context,
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/mainnet/status"
    ) {
      incrementMetric(
        "route.mainnet_status",
      );

      const status =
        refreshMainnetStatus();

      sendJson(
        response,
        200,
        {
          ok: true,
          status,
        },
        context,
      );
      return;
    }

    if (
      route.method === "GET" &&
      route.pathname ===
        "/api/v1/bridge/capabilities"
    ) {
      const status =
        refreshMainnetStatus();

      const executor =
        executorCapability();

      const inboundAuthConfigured =
        Boolean(
          readEnv(
            process.env,
            "PWRC_BRIDGE_API_AUTH_TOKEN",
          ),
        );

      sendJson(
        response,
        200,
        {
          ok: true,
          version:
            "1.0.0",
          quote:
            true,
          execute:
            status.readyForMainnet ===
              true &&
            executor.ready &&
            inboundAuthConfigured,
          mainnetReady:
            status.readyForMainnet ===
            true,
          executorConfigured:
            executor.configured,
          executorEnabled:
            executor.enabled,
          inboundAuthConfigured,
          durableIdempotency:
            true,
          executionStatusEndpoint:
            "/api/v1/bridge/executions/{idempotencyKey}",
          executionAuthentication:
            "server-to-server bearer + idempotency key",
        },
        context,
      );
      return;
    }

    if (
      route.method === "POST" &&
      route.pathname ===
        "/api/v1/bridge/quote"
    ) {
      incrementMetric(
        "route.bridge_quote",
      );

      const body =
        await readJsonBody(
          request,
        );

      sendJson(
        response,
        200,
        {
          ok: true,
          quote:
            quoteBridge(body),
        },
        context,
      );
      return;
    }

    if (
      route.method === "POST" &&
      route.pathname ===
        "/api/v1/bridge/execute"
    ) {
      incrementMetric(
        "route.bridge_execute",
      );

      requireExecutionAuthorization(
        request,
      );

      const idempotencyKey =
        requireIdempotencyKey(
          request,
        );

      const status =
        refreshMainnetStatus({
          fresh:
            true,
        });

      if (
        status.readyForMainnet !==
        true
      ) {
        const error =
          new Error(
            "PWRC_BRIDGE_EXECUTION_NOT_READY",
          );
        error.statusCode =
          503;
        throw error;
      }

      const body =
        await readJsonBody(
          request,
        );

      const quote =
        quoteBridge(body);

      const executionRequest =
        validateExecutionRequest(
          body,
          quote,
        );

      const requestHash =
        canonicalJsonSha256(
          executionRequest,
        );

      const reservation =
        idempotencyStore.reserve({
          key:
            idempotencyKey,
          requestHash,
        });

      if (!reservation.created) {
        const replay =
          idempotencyStore.classifyReplay({
            key:
              idempotencyKey,
            requestHash,
          });

        if (
          replay.kind ===
          "conflict"
        ) {
          const error =
            new Error(
              "PWRC_IDEMPOTENCY_KEY_CONFLICT",
            );
          error.statusCode =
            409;
          throw error;
        }

        if (
          replay.kind ===
          "terminal" &&
          replay.record
            ?.state ===
            "succeeded"
        ) {
          incrementMetric(
            "execution.replayed_success",
          );

          sendJson(
            response,
            200,
            {
              ok: true,
              version:
                "1.0.0",
              replayed:
                true,
              execution:
                replay.record,
            },
            context,
          );
          return;
        }

        if (
          replay.kind ===
          "terminal"
        ) {
          const error =
            new Error(
              "PWRC_EXECUTION_PREVIOUSLY_FAILED",
            );
          error.statusCode =
            409;
          throw error;
        }

        const error =
          new Error(
            "PWRC_EXECUTION_RECONCILIATION_REQUIRED",
          );
        error.statusCode =
          409;
        throw error;
      }

      try {
        const result =
          await submitBridgeExecution({
            body: {
              execution:
                executionRequest,
              quote,
            },
            requestId:
              idempotencyKey,
          });

        const execution =
          idempotencyStore.update(
            idempotencyKey,
            {
              state:
                "succeeded",
              result,
            },
          );

        incrementMetric(
          "execution.succeeded",
        );

        sendJson(
          response,
          202,
          {
            ok: true,
            version:
              "1.0.0",
            replayed:
              false,
            execution,
          },
          context,
        );
        return;
      } catch (error) {
        const ambiguous =
          error?.ambiguous ===
          true;

        idempotencyStore.update(
          idempotencyKey,
          {
            state:
              ambiguous
                ? "ambiguous"
                : "failed",
            errorCode:
              typeof error
                ?.message ===
                "string"
                ? error.message
                : "PWRC_EXECUTION_FAILED",
          },
        );

        incrementMetric(
          ambiguous
            ? "execution.ambiguous"
            : "execution.failed",
        );

        throw error;
      }
    }

    incrementMetric(
      "http.not_found",
    );

    sendJson(
      response,
      404,
      {
        ok: false,
        version:
          "1.0.0",
        error: {
          code:
            "PWRC_HTTP_NOT_FOUND",
          requestId:
            id,
        },
      },
      context,
    );
  } catch (error) {
    incrementMetric(
      "http.errors",
    );

    const normalized =
      publicError(
        error,
        id,
      );

    logger.error(
      "request_failed",
      error,
      {
        requestId:
          id,
        method:
          request.method,
        path:
          request.url,
      },
    );

    sendJson(
      response,
      normalized.statusCode,
      normalized.body,
      context,
    );
  }
}

const server =
  http.createServer(
    (request, response) => {
      void handle(
        request,
        response,
      );
    },
  );

server.requestTimeout =
  30_000;

server.headersTimeout =
  10_000;

server.keepAliveTimeout =
  5_000;

server.maxRequestsPerSocket =
  100;

server.listen(
  port,
  host,
  () => {
    logger.info(
      "api_started",
      {
        host,
        port,
        version:
          "1.0.0",
        readRateLimit,
        writeRateLimit,
      },
    );
  },
);

let shuttingDown =
  false;

function shutdown(
  signal,
) {
  if (shuttingDown) {
    return;
  }

  shuttingDown =
    true;

  logger.info(
    "api_shutdown",
    {
      signal,
    },
  );

  server.close(
    () =>
      process.exit(0),
  );

  server.closeIdleConnections?.();

  setTimeout(
    () => {
      server.closeAllConnections?.();
      process.exit(1);
    },
    10_000,
  ).unref();
}

process.on(
  "SIGTERM",
  () =>
    shutdown(
      "SIGTERM",
    ),
);

process.on(
  "SIGINT",
  () =>
    shutdown(
      "SIGINT",
    ),
);
