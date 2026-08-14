export function createFixedWindowRateLimiter({
  limit = 120,
  windowMs = 60_000,
  maxBuckets = 10_000,
} = {}) {
  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(windowMs) ||
    windowMs < 1_000 ||
    !Number.isSafeInteger(maxBuckets) ||
    maxBuckets < 100
  ) {
    throw new Error(
      "PWRC_RATE_LIMIT_POLICY_INVALID",
    );
  }

  const buckets =
    new Map();

  function prune(now) {
    for (
      const [
        key,
        bucket,
      ] of buckets
    ) {
      if (
        now >=
        bucket.resetAt
      ) {
        buckets.delete(
          key,
        );
      }
    }

    if (
      buckets.size >
      maxBuckets
    ) {
      const overflow =
        buckets.size -
        maxBuckets;

      let removed =
        0;

      for (
        const key of
        buckets.keys()
      ) {
        buckets.delete(
          key,
        );
        removed +=
          1;

        if (
          removed >=
          overflow
        ) {
          break;
        }
      }
    }
  }

  let operations =
    0;

  return function check(
    key,
    now = Date.now(),
  ) {
    operations +=
      1;

    if (
      operations % 256 ===
      0
    ) {
      prune(now);
    }

    const current =
      buckets.get(key);

    if (
      !current ||
      now >=
        current.resetAt
    ) {
      const next = {
        count:
          1,
        resetAt:
          now +
          windowMs,
      };

      buckets.set(
        key,
        next,
      );

      return {
        allowed:
          true,
        remaining:
          limit -
          1,
        resetAt:
          next.resetAt,
      };
    }

    current.count +=
      1;

    if (
      current.count >
      limit
    ) {
      return {
        allowed:
          false,
        remaining:
          0,
        resetAt:
          current.resetAt,
      };
    }

    return {
      allowed:
        true,
      remaining:
        Math.max(
          0,
          limit -
          current.count,
        ),
      resetAt:
        current.resetAt,
    };
  };
}
