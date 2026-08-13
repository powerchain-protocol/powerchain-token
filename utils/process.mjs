import {
  spawnSync,
} from "node:child_process";

const MAX_PROCESS_TIMEOUT_MS =
  30 * 60 * 1000;

const MAX_PROCESS_OUTPUT_BYTES =
  16 * 1024 * 1024;

export function runCommandSync({
  command,
  args = [],
  cwd = process.cwd(),
  env = process.env,
  timeoutMs = 60_000,
  allowFailure = false,
  maxOutputBytes =
    1_000_000,
  input,
}) {
  if (
    typeof command !== "string" ||
    !command.trim() ||
    command.includes("\0")
  ) {
    throw new Error(
      "POWERCHAIN_COMMAND_REQUIRED",
    );
  }

  if (
    !Array.isArray(args) ||
    !args.every(
      (value) =>
        typeof value ===
          "string" &&
        !value.includes("\0"),
    )
  ) {
    throw new Error(
      "POWERCHAIN_COMMAND_ARGS_INVALID",
    );
  }

  if (
    !Number.isSafeInteger(
      timeoutMs,
    ) ||
    timeoutMs < 1 ||
    timeoutMs >
      MAX_PROCESS_TIMEOUT_MS
  ) {
    throw new Error(
      "POWERCHAIN_COMMAND_TIMEOUT_INVALID",
    );
  }

  if (
    !Number.isSafeInteger(
      maxOutputBytes,
    ) ||
    maxOutputBytes < 1 ||
    maxOutputBytes >
      MAX_PROCESS_OUTPUT_BYTES
  ) {
    throw new Error(
      "POWERCHAIN_COMMAND_OUTPUT_LIMIT_INVALID",
    );
  }

  if (
    input !== undefined &&
    typeof input !== "string" &&
    !Buffer.isBuffer(input) &&
    !ArrayBuffer.isView(input)
  ) {
    throw new Error(
      "POWERCHAIN_COMMAND_INPUT_INVALID",
    );
  }

  const result =
    spawnSync(
      command,
      args,
      {
        cwd,
        env: {
          ...env,
        },
        shell: false,
        encoding: "utf8",
        timeout:
          timeoutMs,
        maxBuffer:
          maxOutputBytes,
        input,
        windowsHide: true,
      },
    );

  const timedOut =
    result.error?.code ===
      "ETIMEDOUT";

  const normalized = {
    command,
    args:
      [...args],
    status:
      result.status,
    signal:
      result.signal ??
      null,
    stdout:
      result.stdout ?? "",
    stderr:
      result.stderr ?? "",
    error:
      result.error ??
      null,
    timedOut,
    ok:
      result.status === 0 &&
      !result.error,
  };

  if (
    !allowFailure &&
    !normalized.ok
  ) {
    const error =
      new Error(
        timedOut
          ? `POWERCHAIN_COMMAND_TIMEOUT:${command}`
          : `POWERCHAIN_COMMAND_FAILED:${command}`,
      );

    Object.assign(
      error,
      {
        commandResult:
          normalized,
      },
    );

    throw error;
  }

  return normalized;
}
