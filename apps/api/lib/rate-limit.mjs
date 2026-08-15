import {
  isIP,
} from "node:net";

function assertPositiveInteger(
  value,
  code,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    throw new Error(code);
  }

  return value;
}

function normalizeIp(
  value,
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();
  const unwrapped =
    trimmed.startsWith("[") &&
    trimmed.endsWith("]")
      ? trimmed.slice(1, -1)
      : trimmed;
  const normalized =
    unwrapped.startsWith(
      "::ffff:",
    )
      ? unwrapped.slice(7)
      : unwrapped;

  return isIP(normalized)
    ? normalized
    : null;
}

export function parseTrustedProxyAddresses(
  value,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return Object.freeze([]);
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "PWRC_TRUSTED_PROXY_ADDRESSES_INVALID",
    );
  }

  const addresses =
    value
      .split(",")
      .map(
        (item) =>
          normalizeIp(item),
      );

  if (
    addresses.some(
      (address) =>
        address === null,
    ) ||
    addresses.length > 32
  ) {
    throw new Error(
      "PWRC_TRUSTED_PROXY_ADDRESSES_INVALID",
    );
  }

  return Object.freeze(
    [
      ...new Set(addresses),
    ],
  );
}

export function resolveRateLimitClientKey(
  req,
  {
    trustedProxyAddresses = [],
    maxForwardedHops = 1,
  } = {},
) {
  assertPositiveInteger(
    maxForwardedHops,
    "PWRC_TRUSTED_PROXY_HOPS_INVALID",
  );

  if (
    maxForwardedHops > 8
  ) {
    throw new Error(
      "PWRC_TRUSTED_PROXY_HOPS_INVALID",
    );
  }

  const remoteAddress =
    normalizeIp(
      req?.socket?.remoteAddress,
    ) ??
    "unknown";
  const trusted =
    new Set(
      trustedProxyAddresses,
    );

  if (
    remoteAddress === "unknown" ||
    !trusted.has(
      remoteAddress,
    )
  ) {
    return `ip:${remoteAddress}`;
  }

  const forwarded =
    req?.headers?.[
      "x-forwarded-for"
    ];

  if (
    typeof forwarded !== "string"
  ) {
    return `ip:${remoteAddress}`;
  }

  const chain =
    forwarded
      .split(",")
      .map(
        (item) =>
          normalizeIp(item),
      );

  if (
    chain.length < 1 ||
    chain.length > 16 ||
    chain.some(
      (address) =>
        address === null,
    )
  ) {
    return `ip:${remoteAddress}`;
  }

  let hops = 0;

  for (
    let index =
      chain.length - 1;
    index >= 0;
    index -= 1
  ) {
    const candidate =
      chain[index];

    if (
      trusted.has(candidate) &&
      hops < maxForwardedHops
    ) {
      hops += 1;
      continue;
    }

    return `ip:${candidate}`;
  }

  return `ip:${remoteAddress}`;
}

export function createTokenBucketRateLimiter({
  ratePerMinute = 120,
  burst = ratePerMinute,
  maxBuckets = 10_000,
  idleTtlMs = 10 * 60_000,
} = {}) {
  assertPositiveInteger(
    ratePerMinute,
    "PWRC_RATE_LIMIT_POLICY_INVALID",
  );
  assertPositiveInteger(
    burst,
    "PWRC_RATE_LIMIT_POLICY_INVALID",
  );
  assertPositiveInteger(
    maxBuckets,
    "PWRC_RATE_LIMIT_POLICY_INVALID",
  );
  assertPositiveInteger(
    idleTtlMs,
    "PWRC_RATE_LIMIT_POLICY_INVALID",
  );

  if (
    ratePerMinute > 100_000 ||
    burst > ratePerMinute * 4 ||
    maxBuckets < 100 ||
    idleTtlMs < 60_000 ||
    idleTtlMs > 24 * 60 * 60_000
  ) {
    throw new Error(
      "PWRC_RATE_LIMIT_POLICY_INVALID",
    );
  }

  const refillPerMs =
    ratePerMinute /
    60_000;
  const buckets =
    new Map();
  let operations =
    0;

  function prune(now) {
    for (const [key, bucket] of buckets) {
      if (
        now -
          bucket.lastSeenAt >=
        idleTtlMs
      ) {
        buckets.delete(key);
      }
    }

    if (
      buckets.size <=
      maxBuckets
    ) {
      return;
    }

    const ordered =
      [
        ...buckets.entries(),
      ].sort(
        (a, b) =>
          a[1].lastSeenAt -
          b[1].lastSeenAt,
      );
    const overflow =
      buckets.size -
      maxBuckets;

    for (
      let index = 0;
      index < overflow;
      index += 1
    ) {
      buckets.delete(
        ordered[index][0],
      );
    }
  }

  return function check(
    key,
    now = Date.now(),
  ) {
    if (
      typeof key !== "string" ||
      key.length < 1 ||
      key.length > 256 ||
      !Number.isSafeInteger(now) ||
      now < 0
    ) {
      throw new Error(
        "PWRC_RATE_LIMIT_INPUT_INVALID",
      );
    }

    operations += 1;
    if (
      operations % 256 === 0
    ) {
      prune(now);
    }

    let bucket =
      buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens:
          burst,
        updatedAt:
          now,
        lastSeenAt:
          now,
      };
      buckets.set(
        key,
        bucket,
      );
    }

    const elapsed =
      Math.max(
        0,
        now -
          bucket.updatedAt,
      );

    bucket.tokens =
      Math.min(
        burst,
        bucket.tokens +
          elapsed *
            refillPerMs,
      );
    bucket.updatedAt =
      now;
    bucket.lastSeenAt =
      now;

    const allowed =
      bucket.tokens >= 1;

    if (allowed) {
      bucket.tokens -= 1;
    }

    const tokensNeeded =
      allowed
        ? Math.max(
            0,
            burst -
              bucket.tokens,
          )
        : Math.max(
            0,
            1 -
              bucket.tokens,
          );
    const retryAfterMs =
      allowed
        ? 0
        : Math.max(
            1,
            Math.ceil(
              tokensNeeded /
                refillPerMs,
            ),
          );
    const fullResetMs =
      Math.ceil(
        Math.max(
          0,
          burst -
            bucket.tokens,
        ) /
          refillPerMs,
      );

    return {
      allowed,
      limit:
        burst,
      remaining:
        Math.max(
          0,
          Math.floor(
            bucket.tokens,
          ),
        ),
      retryAfterMs,
      resetAt:
        now +
        fullResetMs,
      policy:
        "token-bucket",
    };
  };
}

// Compatibility helper retained for existing integrations/tests.
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
  let operations =
    0;

  function prune(now) {
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) {
        buckets.delete(key);
      }
    }

    if (buckets.size > maxBuckets) {
      const overflow =
        buckets.size - maxBuckets;
      let removed = 0;
      for (const key of buckets.keys()) {
        buckets.delete(key);
        removed += 1;
        if (removed >= overflow) break;
      }
    }
  }

  return function check(
    key,
    now = Date.now(),
  ) {
    operations += 1;
    if (operations % 256 === 0) {
      prune(now);
    }

    const current =
      buckets.get(key);

    if (!current || now >= current.resetAt) {
      const next = {
        count: 1,
        resetAt: now + windowMs,
      };
      buckets.set(key, next);
      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        retryAfterMs: 0,
        resetAt: next.resetAt,
        policy: "fixed-window",
      };
    }

    current.count += 1;
    const allowed =
      current.count <= limit;

    return {
      allowed,
      limit,
      remaining: allowed
        ? Math.max(0, limit - current.count)
        : 0,
      retryAfterMs: allowed
        ? 0
        : Math.max(1, current.resetAt - now),
      resetAt: current.resetAt,
      policy: "fixed-window",
    };
  };
}
