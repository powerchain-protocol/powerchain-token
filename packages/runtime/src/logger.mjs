import {
  redactValue,
} from "./redact.mjs";
import {
  serializeError,
} from "./errors.mjs";

const LEVELS =
  new Set([
    "debug",
    "info",
    "warn",
    "error",
  ]);

export function createLogger({
  component,
  write =
    (line) =>
      process.stderr.write(
        `${line}\n`,
      ),
  now =
    () =>
      new Date()
        .toISOString(),
} = {}) {
  if (
    typeof component !==
      "string" ||
    !component.trim()
  ) {
    throw new Error(
      "POWERCHAIN_LOG_COMPONENT_REQUIRED",
    );
  }

  function emit(
    level,
    message,
    fields = {},
  ) {
    if (!LEVELS.has(level)) {
      throw new Error(
        "POWERCHAIN_LOG_LEVEL_INVALID",
      );
    }

    const record = {
      timestamp:
        now(),
      level,
      component:
        component.trim(),
      message:
        String(message),
      ...redactValue(
        fields,
      ),
    };

    write(
      JSON.stringify(
        record,
      ),
    );
  }

  return {
    debug:
      (message, fields) =>
        emit(
          "debug",
          message,
          fields,
        ),
    info:
      (message, fields) =>
        emit(
          "info",
          message,
          fields,
        ),
    warn:
      (message, fields) =>
        emit(
          "warn",
          message,
          fields,
        ),
    error:
      (
        message,
        error,
        fields = {},
      ) =>
        emit(
          "error",
          message,
          {
            ...fields,
            error:
              serializeError(
                error,
              ),
          },
        ),
  };
}
