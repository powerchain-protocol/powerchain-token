export const SECOND_MS =
  1_000;

export const MINUTE_MS =
  60 * SECOND_MS;

export const HOUR_MS =
  60 * MINUTE_MS;

export function parseIsoTimestamp(
  value,
  label = "timestamp",
) {
  const parsed =
    Date.parse(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `POWERCHAIN_TIMESTAMP_INVALID:${label}`,
    );
  }

  return parsed;
}

export function assertFreshTimestamp({
  timestamp,
  maxAgeMs,
  maxFutureSkewMs = 0,
  now = Date.now(),
  label = "timestamp",
}) {
  const observedAt =
    parseIsoTimestamp(
      timestamp,
      label,
    );

  if (
    !Number.isSafeInteger(
      maxAgeMs,
    ) ||
    maxAgeMs < 0 ||
    !Number.isSafeInteger(
      maxFutureSkewMs,
    ) ||
    maxFutureSkewMs < 0
  ) {
    throw new Error(
      "POWERCHAIN_TIME_POLICY_INVALID",
    );
  }

  if (
    observedAt >
    now + maxFutureSkewMs
  ) {
    throw new Error(
      `POWERCHAIN_TIMESTAMP_IN_FUTURE:${label}`,
    );
  }

  if (
    now - observedAt >
    maxAgeMs
  ) {
    throw new Error(
      `POWERCHAIN_TIMESTAMP_STALE:${label}`,
    );
  }

  return observedAt;
}
