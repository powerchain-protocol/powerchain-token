import {
  normalizeRpcUrl,
  normalizeWebSocketUrl,
} from "./urls.js";

export function readEnv(
  env: NodeJS.ProcessEnv,
  name: string,
): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

export function requireEnv(
  env: NodeJS.ProcessEnv,
  name: string,
): string {
  const value = readEnv(env, name);
  if (!value) {
    throw new Error(
      `POWERCHAIN_ENV_REQUIRED:${name}`,
    );
  }
  return value;
}

export function readBooleanEnv(
  env: NodeJS.ProcessEnv,
  name: string,
): boolean | undefined {
  const value =
    readEnv(env, name)?.toLowerCase();

  if (value === undefined) {
    return undefined;
  }

  if (
    value === "1" ||
    value === "true" ||
    value === "yes"
  ) {
    return true;
  }

  if (
    value === "0" ||
    value === "false" ||
    value === "no"
  ) {
    return false;
  }

  throw new Error(
    `POWERCHAIN_ENV_BOOLEAN_INVALID:${name}`,
  );
}

export function readIntegerEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  options: {
    min?: number;
    max?: number;
  } = {},
): number | undefined {
  const raw = readEnv(env, name);

  if (raw === undefined) {
    return undefined;
  }

  if (!/^-?\d+$/.test(raw)) {
    throw new Error(
      `POWERCHAIN_ENV_INTEGER_INVALID:${name}`,
    );
  }

  const value = Number(raw);

  if (
    !Number.isSafeInteger(value) ||
    (
      options.min !== undefined &&
      value < options.min
    ) ||
    (
      options.max !== undefined &&
      value > options.max
    )
  ) {
    throw new Error(
      `POWERCHAIN_ENV_INTEGER_OUT_OF_RANGE:${name}`,
    );
  }

  return value;
}

export function readEnumEnv<
  const T extends readonly string[],
>(
  env: NodeJS.ProcessEnv,
  name: string,
  allowed: T,
): T[number] | undefined {
  const value = readEnv(env, name);

  if (value === undefined) {
    return undefined;
  }

  if (
    !allowed.includes(
      value as T[number],
    )
  ) {
    throw new Error(
      `POWERCHAIN_ENV_ENUM_INVALID:${name}`,
    );
  }

  return value as T[number];
}

export function readRpcEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  production: boolean,
): string | undefined {
  const value = readEnv(env, name);
  return value
    ? normalizeRpcUrl(
        value,
        production,
      )
    : undefined;
}

export function readWsEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  production: boolean,
): string | undefined {
  const value = readEnv(env, name);
  return value
    ? normalizeWebSocketUrl(
        value,
        production,
      )
    : undefined;
}
