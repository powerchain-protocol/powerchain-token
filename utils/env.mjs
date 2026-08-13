export function readEnv(
  env,
  name,
) {
  const value =
    env?.[name];

  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed ||
    undefined;
}

export function requireEnv(
  env,
  name,
) {
  const value =
    readEnv(env, name);

  if (!value) {
    throw new Error(
      `POWERCHAIN_ENV_REQUIRED:${name}`,
    );
  }

  return value;
}

export function readBooleanEnv(
  env,
  name,
) {
  const value =
    readEnv(
      env,
      name,
    )?.toLowerCase();

  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    ["1", "true", "yes"]
      .includes(value)
  ) {
    return true;
  }

  if (
    ["0", "false", "no"]
      .includes(value)
  ) {
    return false;
  }

  throw new Error(
    `POWERCHAIN_ENV_BOOLEAN_INVALID:${name}`,
  );
}

export function readSafeIntegerEnv(
  env,
  name,
  {
    min =
      Number.MIN_SAFE_INTEGER,
    max =
      Number.MAX_SAFE_INTEGER,
  } = {},
) {
  const raw =
    readEnv(env, name);

  if (
    raw === undefined
  ) {
    return undefined;
  }

  if (!/^-?\d+$/.test(raw)) {
    throw new Error(
      `POWERCHAIN_ENV_INTEGER_INVALID:${name}`,
    );
  }

  const value =
    Number(raw);

  if (
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(
      `POWERCHAIN_ENV_INTEGER_RANGE:${name}`,
    );
  }

  return value;
}
