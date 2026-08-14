export function optionalTrimmed(value) {
  const out = value?.trim();
  return out ? out : null;
}

export function parseBoolean(value, fallback = false) {
  if (value == null || value === "") return fallback;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error("POWERCHAIN_BOOLEAN_INVALID");
}

export function safeJson(value) {
  return JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? item.toString() : item
  );
}

export function createLogger(component) {
  if (!component) throw new Error("POWERCHAIN_LOG_COMPONENT_REQUIRED");
  return {
    info(message, fields = {}) {
      process.stderr.write(
        `${safeJson({timestamp:new Date().toISOString(),level:"info",component,message,...fields})}\n`
      );
    },
    error(message, fields = {}) {
      process.stderr.write(
        `${safeJson({timestamp:new Date().toISOString(),level:"error",component,message,...fields})}\n`
      );
    }
  };
}
