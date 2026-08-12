import { normalizeRpcUrl, normalizeWebSocketUrl } from "./urls.js";

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
  if (!value) throw new Error(`POWERCHAIN_ENV_REQUIRED:${name}`);
  return value;
}

export function readRpcEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  production: boolean,
): string | undefined {
  const value = readEnv(env, name);
  return value ? normalizeRpcUrl(value, production) : undefined;
}

export function readWsEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  production: boolean,
): string | undefined {
  const value = readEnv(env, name);
  return value ? normalizeWebSocketUrl(value, production) : undefined;
}
