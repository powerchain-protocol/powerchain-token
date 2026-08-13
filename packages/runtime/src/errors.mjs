import {
  redactText,
} from "./redact.mjs";

export function errorMessage(
  error,
) {
  let message;

  if (
    error instanceof Error
  ) {
    message =
      error.message;
  } else if (
    typeof error === "string"
  ) {
    message =
      error;
  } else {
    try {
      message =
        JSON.stringify(
          error,
        );
    } catch {
      message =
        "Unknown error";
    }
  }

  return redactText(
    message,
  );
}

export function serializeError(
  error,
) {
  if (
    !(error instanceof Error)
  ) {
    return {
      name:
        "NonError",
      message:
        errorMessage(error),
    };
  }

  return {
    name:
      error.name,
    message:
      redactText(
        error.message,
      ),
    code:
      typeof error.code ===
        "string"
        ? redactText(
            error.code,
          )
        : undefined,
    cause:
      error.cause
        ? errorMessage(
            error.cause,
          )
        : undefined,
  };
}
