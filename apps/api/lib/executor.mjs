import {
  readBooleanEnv,
  readEnv,
  requireEnv,
} from "../../../utils/env.mjs";
import {
  assertHttpsUrl,
} from "../../../utils/network.mjs";
import {
  redactValue,
} from "../../../utils/redact.mjs";

const EXECUTOR_TIMEOUT_MS =
  20_000;

export function executorCapability(
  env = process.env,
) {
  const enabled =
    readBooleanEnv(
      env,
      "PWRC_BRIDGE_EXECUTION_ENABLED",
    ) ?? false;

  const url =
    readEnv(
      env,
      "PWRC_BRIDGE_EXECUTOR_URL",
    );

  const apiKey =
    readEnv(
      env,
      "PWRC_BRIDGE_EXECUTOR_API_KEY",
    );

  return {
    enabled,
    configured:
      Boolean(
        url &&
        apiKey,
      ),
    ready:
      enabled &&
      Boolean(
        url &&
        apiKey,
      ),
  };
}

export async function submitBridgeExecution({
  body,
  requestId,
  env =
    process.env,
}) {
  const capability =
    executorCapability(env);

  if (!capability.ready) {
    const error =
      new Error(
        "PWRC_BRIDGE_EXECUTION_DISABLED",
      );
    error.statusCode = 503;
    error.ambiguous = false;
    throw error;
  }

  const endpoint =
    assertHttpsUrl(
      requireEnv(
        env,
        "PWRC_BRIDGE_EXECUTOR_URL",
      ),
      "PWRC_BRIDGE_EXECUTOR_URL",
    );

  const apiKey =
    requireEnv(
      env,
      "PWRC_BRIDGE_EXECUTOR_API_KEY",
    );

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      EXECUTOR_TIMEOUT_MS,
    );

  try {
    const response =
      await fetch(
        endpoint,
        {
          method:
            "POST",
          redirect:
            "error",
          headers: {
            "Authorization":
              `Bearer ${apiKey}`,
            "Content-Type":
              "application/json",
            "Idempotency-Key":
              requestId,
            "X-PowerChain-Version":
              "1.0.0",
          },
          body:
            JSON.stringify(
              body,
            ),
          signal:
            controller.signal,
        },
      );

    const text =
      await response.text();

    let payload = null;

    try {
      payload =
        text
          ? JSON.parse(text)
          : null;
    } catch {
      payload = {
        response:
          "non-json",
      };
    }

    if (!response.ok) {
      const ambiguous =
        response.status >=
        500;

      const error =
        new Error(
          ambiguous
            ? "PWRC_BRIDGE_EXECUTION_AMBIGUOUS_EXECUTOR_ERROR"
            : "PWRC_BRIDGE_EXECUTOR_REJECTED",
        );

      error.statusCode =
        ambiguous
          ? 502
          : response.status;

      error.executorStatus =
        response.status;

      error.ambiguous =
        ambiguous;

      throw error;
    }

    return {
      ok: true,
      requestId,
      executorStatus:
        response.status,
      result:
        redactValue(
          payload,
        ),
    };
  } catch (error) {
    if (
      error?.name ===
        "AbortError"
    ) {
      const ambiguous =
        new Error(
          "PWRC_BRIDGE_EXECUTION_AMBIGUOUS_TIMEOUT",
        );
      ambiguous.statusCode =
        504;
      ambiguous.ambiguous =
        true;
      throw ambiguous;
    }

    if (
      error?.ambiguous !==
        undefined
    ) {
      throw error;
    }

    // A network failure after fetch begins cannot prove the executor did not
    // receive the request. Treat it as ambiguous and require reconciliation.
    const ambiguous =
      new Error(
        "PWRC_BRIDGE_EXECUTION_AMBIGUOUS_NETWORK",
      );
    ambiguous.statusCode =
      502;
    ambiguous.ambiguous =
      true;
    ambiguous.cause =
      error;
    throw ambiguous;
  } finally {
    clearTimeout(timer);
  }
}
