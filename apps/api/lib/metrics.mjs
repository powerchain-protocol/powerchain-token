const startedAt =
  Date.now();

const counters =
  new Map();

export function incrementMetric(
  name,
  value = 1,
) {
  if (
    typeof name !==
      "string" ||
    !/^[a-z][a-z0-9_.-]{0,63}$/i.test(
      name,
    ) ||
    !Number.isSafeInteger(value)
  ) {
    throw new Error(
      "PWRC_METRIC_INVALID",
    );
  }

  counters.set(
    name,
    (counters.get(name) ??
      0) +
      value,
  );
}

export function metricsSnapshot() {
  return {
    version:
      "1.0.0",
    uptimeSeconds:
      Math.floor(
        (
          Date.now() -
          startedAt
        ) /
          1000,
      ),
    counters:
      Object.fromEntries(
        [...counters.entries()]
          .sort(
            (
              [left],
              [right],
            ) =>
              left.localeCompare(
                right,
              ),
          ),
      ),
  };
}
