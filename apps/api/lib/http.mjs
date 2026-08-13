import crypto from "node:crypto";
import {
  redactValue,
} from "../../../packages/runtime/src/redact.mjs";

export const MAX_JSON_BODY_BYTES =
  64 * 1024;

const DEFAULT_SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "Cross-Origin-Opener-Policy":
    "same-origin",
  "Cross-Origin-Resource-Policy":
    "same-origin",
  "Referrer-Policy":
    "no-referrer",
  "X-Content-Type-Options":
    "nosniff",
  "X-Frame-Options":
    "DENY",
};

export function requestId(
  request,
) {
  const supplied =
    request.headers[
      "x-request-id"
    ];

  if (
    typeof supplied ===
      "string" &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(
      supplied,
    )
  ) {
    return supplied;
  }

  return crypto
    .randomUUID();
}

export function sendJson(
  response,
  status,
  body,
  {
    requestId: id,
    origin,
    allowedOrigin,
    extraHeaders = {},
  } = {},
) {
  const headers = {
    ...DEFAULT_SECURITY_HEADERS,
    "Cache-Control":
      "no-store",
    "Content-Type":
      "application/json; charset=utf-8",
    "X-Request-Id":
      id ?? "",
    ...extraHeaders,
  };

  if (
    allowedOrigin &&
    origin === allowedOrigin
  ) {
    headers[
      "Access-Control-Allow-Origin"
    ] = allowedOrigin;
    headers["Vary"] =
      "Origin";
  }

  response.writeHead(
    status,
    headers,
  );

  response.end(
    `${JSON.stringify(
      body,
    )}\n`,
  );
}

export async function readJsonBody(
  request,
  {
    maxBytes =
      MAX_JSON_BODY_BYTES,
  } = {},
) {
  const contentType =
    request.headers[
      "content-type"
    ] ?? "";

  if (
    !String(contentType)
      .toLowerCase()
      .startsWith(
        "application/json",
      )
  ) {
    const error =
      new Error(
        "PWRC_HTTP_JSON_REQUIRED",
      );
    error.statusCode = 415;
    throw error;
  }

  let size = 0;
  const chunks = [];

  for await (
    const chunk of request
  ) {
    size += chunk.length;

    if (size > maxBytes) {
      const error =
        new Error(
          "PWRC_HTTP_BODY_TOO_LARGE",
        );
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (size === 0) {
    const error =
      new Error(
        "PWRC_HTTP_BODY_REQUIRED",
      );
    error.statusCode = 400;
    throw error;
  }

  try {
    return JSON.parse(
      Buffer.concat(chunks)
        .toString("utf8"),
    );
  } catch {
    const error =
      new Error(
        "PWRC_HTTP_JSON_INVALID",
      );
    error.statusCode = 400;
    throw error;
  }
}

export function publicError(
  error,
  id,
) {
  const statusCode =
    Number.isInteger(
      error?.statusCode,
    )
      ? error.statusCode
      : 500;

  const code =
    typeof error?.message ===
      "string" &&
    /^PWRC_[A-Z0-9_:.-]+$/.test(
      error.message,
    )
      ? error.message
      : "PWRC_INTERNAL_ERROR";

  return {
    statusCode,
    body: redactValue({
      ok: false,
      version: "1.0.0",
      error: {
        code,
        requestId: id,
      },
    }),
  };
}
