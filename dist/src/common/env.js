import { normalizeRpcUrl, normalizeWebSocketUrl, } from "./urls.js";
export function readEnv(env, name) {
    const value = env[name]?.trim();
    return value ? value : undefined;
}
export function requireEnv(env, name) {
    const value = readEnv(env, name);
    if (!value) {
        throw new Error(`POWERCHAIN_ENV_REQUIRED:${name}`);
    }
    return value;
}
export function readBooleanEnv(env, name) {
    const value = readEnv(env, name)?.toLowerCase();
    if (value === undefined) {
        return undefined;
    }
    if (value === "1" ||
        value === "true" ||
        value === "yes") {
        return true;
    }
    if (value === "0" ||
        value === "false" ||
        value === "no") {
        return false;
    }
    throw new Error(`POWERCHAIN_ENV_BOOLEAN_INVALID:${name}`);
}
export function readIntegerEnv(env, name, options = {}) {
    const raw = readEnv(env, name);
    if (raw === undefined) {
        return undefined;
    }
    if (!/^-?\d+$/.test(raw)) {
        throw new Error(`POWERCHAIN_ENV_INTEGER_INVALID:${name}`);
    }
    const value = Number(raw);
    if (!Number.isSafeInteger(value) ||
        (options.min !== undefined &&
            value < options.min) ||
        (options.max !== undefined &&
            value > options.max)) {
        throw new Error(`POWERCHAIN_ENV_INTEGER_OUT_OF_RANGE:${name}`);
    }
    return value;
}
export function readEnumEnv(env, name, allowed) {
    const value = readEnv(env, name);
    if (value === undefined) {
        return undefined;
    }
    if (!allowed.includes(value)) {
        throw new Error(`POWERCHAIN_ENV_ENUM_INVALID:${name}`);
    }
    return value;
}
export function readRpcEnv(env, name, production) {
    const value = readEnv(env, name);
    return value
        ? normalizeRpcUrl(value, production)
        : undefined;
}
export function readWsEnv(env, name, production) {
    const value = readEnv(env, name);
    return value
        ? normalizeWebSocketUrl(value, production)
        : undefined;
}
//# sourceMappingURL=env.js.map