export interface BoundedIdempotencyRegistryOptions {
  ttlMs:
    number;
  maxEntries:
    number;
}

export interface IdempotencyClaim {
  key:
    string;
  claimedAt:
    number;
  expiresAt:
    number;
}

export function createBoundedIdempotencyRegistry(
  options:
    BoundedIdempotencyRegistryOptions,
) {
  if (
    !Number.isSafeInteger(
      options.ttlMs,
    ) ||
    options.ttlMs <
      1_000 ||
    options.ttlMs >
      24 * 60 * 60_000
  ) {
    throw new Error(
      "PWRC_IDEMPOTENCY_TTL_INVALID",
    );
  }

  if (
    !Number.isSafeInteger(
      options.maxEntries,
    ) ||
    options.maxEntries <
      100 ||
    options.maxEntries >
      1_000_000
  ) {
    throw new Error(
      "PWRC_IDEMPOTENCY_MAX_ENTRIES_INVALID",
    );
  }


function assertNow(
  now:
    number,
): number {
  if (
    !Number.isSafeInteger(
      now,
    ) ||
    now <
      0 ||
    now >
      Number.MAX_SAFE_INTEGER -
        options.ttlMs
  ) {
    throw new Error(
      "PWRC_IDEMPOTENCY_CLOCK_INVALID",
    );
  }

  return now;
}

  const claims =
    new Map<
      string,
      IdempotencyClaim
    >();

  function prune(
    now:
      number,
  ) {
    assertNow(
      now,
    );

    for (
      const [
        key,
        claim,
      ] of claims
    ) {
      if (
        now >=
        claim.expiresAt
      ) {
        claims.delete(
          key,
        );
      }
    }
  }

  function normalizeKey(
    key:
      string,
  ) {
    const normalized =
      key.trim();

    if (
      !/^[A-Za-z0-9._:-]{8,128}$/.test(
        normalized,
      )
    ) {
      throw new Error(
        "PWRC_IDEMPOTENCY_KEY_INVALID",
      );
    }

    return normalized;
  }

  return {
    claim(
      key:
        string,
      now =
        Date.now(),
    ): IdempotencyClaim {
      const normalized =
        normalizeKey(
          key,
        );

      assertNow(
        now,
      );
      prune(
        now,
      );

      const existing =
        claims.get(
          normalized,
        );

      if (
        existing &&
        now <
          existing.expiresAt
      ) {
        throw new Error(
          "PWRC_IDEMPOTENCY_REPLAY",
        );
      }

      if (
        claims.size >=
          options.maxEntries
      ) {
        throw new Error(
          "PWRC_IDEMPOTENCY_REGISTRY_FULL",
        );
      }

      const claim = {
        key:
          normalized,
        claimedAt:
          now,
        expiresAt:
          now +
          options.ttlMs,
      };

      claims.set(
        normalized,
        claim,
      );

      return claim;
    },

    has(
      key:
        string,
      now =
        Date.now(),
    ): boolean {
      const normalized =
        normalizeKey(
          key,
        );

      assertNow(
        now,
      );

      const claim =
        claims.get(
          normalized,
        );

      if (!claim) {
        return false;
      }

      if (
        now >=
        claim.expiresAt
      ) {
        claims.delete(
          normalized,
        );
        return false;
      }

      return true;
    },

    size() {
      return claims.size;
    },

    prune,
  };
}
