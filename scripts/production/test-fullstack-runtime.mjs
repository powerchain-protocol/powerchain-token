import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  FixedWindowRateLimiter,
} from "../../apps/api/lib/rate-limit.mjs";
import {
  TtlCache,
} from "../../apps/api/lib/cache.mjs";
import {
  FileExecutionIdempotencyStore,
} from "../../apps/api/lib/idempotency.mjs";
import {
  canonicalJsonSha256,
} from "../../utils/crypto.mjs";

const failures = [];

const limiter =
  new FixedWindowRateLimiter({
    limit: 2,
    windowMs:
      1_000,
    maxEntries:
      10,
  });

if (
  !limiter.consume(
    "client",
    1_000,
  ).allowed ||
  !limiter.consume(
    "client",
    1_001,
  ).allowed ||
  limiter.consume(
    "client",
    1_002,
  ).allowed
) {
  failures.push(
    "rate-limit",
  );
}

if (
  !limiter.consume(
    "client",
    2_001,
  ).allowed
) {
  failures.push(
    "rate-limit-reset",
  );
}

let loads = 0;

const cache =
  new TtlCache({
    ttlMs:
      1_000,
  });

const first =
  cache.get(
    () => {
      loads += 1;
      return loads;
    },
    1_000,
  );

const cached =
  cache.get(
    () => {
      loads += 1;
      return loads;
    },
    1_100,
  );

const refreshed =
  cache.get(
    () => {
      loads += 1;
      return loads;
    },
    2_001,
  );

if (
  first !== 1 ||
  cached !== 1 ||
  refreshed !== 2
) {
  failures.push(
    "ttl-cache",
  );
}

const directory =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "pwrc-idempotency-",
    ),
  );

try {
  const store =
    new FileExecutionIdempotencyStore({
      directory,
    });

  const key =
    "test-execution-1";

  const requestHash =
    canonicalJsonSha256({
      version:
        "1.0.0",
      amount:
        "1000",
    });

  const firstReservation =
    store.reserve({
      key,
      requestHash,
    });

  const secondReservation =
    store.reserve({
      key,
      requestHash,
    });

  if (
    !firstReservation
      .created ||
    secondReservation
      .created
  ) {
    failures.push(
      "idempotency-reserve",
    );
  }

  const conflict =
    store.classifyReplay({
      key,
      requestHash:
        canonicalJsonSha256({
          different:
            true,
        }),
    });

  if (
    conflict.kind !==
      "conflict"
  ) {
    failures.push(
      "idempotency-conflict",
    );
  }

  store.update(
    key,
    {
      state:
        "ambiguous",
      errorCode:
        "PWRC_TEST_AMBIGUOUS",
    },
  );

  const ambiguous =
    store.classifyReplay({
      key,
      requestHash,
    });

  if (
    ambiguous.kind !==
      "in-progress" ||
    ambiguous.record
      ?.state !==
      "ambiguous"
  ) {
    failures.push(
      "idempotency-ambiguous",
    );
  }

  store.update(
    key,
    {
      state:
        "succeeded",
      result: {
        signature:
          "test",
      },
    },
  );

  const terminal =
    store.classifyReplay({
      key,
      requestHash,
    });

  if (
    terminal.kind !==
      "terminal" ||
    terminal.record
      ?.state !==
      "succeeded"
  ) {
    failures.push(
      "idempotency-terminal",
    );
  }

  // Restart simulation.
  const restarted =
    new FileExecutionIdempotencyStore({
      directory,
    });

  if (
    restarted.read(key)
      ?.state !==
      "succeeded"
  ) {
    failures.push(
      "idempotency-restart",
    );
  }
} finally {
  fs.rmSync(
    directory,
    {
      recursive:
        true,
      force:
        true,
    },
  );
}

console.log(
  JSON.stringify({
    ok:
      failures.length ===
      0,
    version:
      "1.0.0",
    tests: {
      rateLimit:
        true,
      ttlCache:
        true,
      durableIdempotency:
        true,
      conflictDetection:
        true,
      ambiguousRecovery:
        true,
      restartPersistence:
        true,
    },
    failures,
  }, null, 2),
);

if (failures.length) {
  process.exit(1);
}
