import {
  assertSolanaAddress,
  buildFeeQuote,
  parseBaseUnits,
  parseOperation,
  parseServiceFeeBps,
} from "../../apps/api/lib/fees.mjs";
import {
  createFixedWindowRateLimiter,
} from "../../apps/api/lib/rate-limit.mjs";

const failures = [];

function expectThrow(
  fn,
  code,
) {
  try {
    fn();
    failures.push(
      `expected-throw:${code}`,
    );
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== code
    ) {
      failures.push(
        `wrong-error:${code}:${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }
}

if (
  parseBaseUnits(
    "1000000000",
  ) !==
  1_000_000_000n
) {
  failures.push(
    "parse-base-units",
  );
}

expectThrow(
  () =>
    parseBaseUnits(
      "-1",
    ),
  "PWRC_AMOUNT_INVALID",
);

expectThrow(
  () =>
    parseBaseUnits(
      "18446744073709551616",
    ),
  "PWRC_AMOUNT_EXCEEDS_U64",
);

expectThrow(
  () =>
    parseOperation(
      "arbitrary-write",
    ),
  "PWRC_OPERATION_INVALID",
);

expectThrow(
  () =>
    parseServiceFeeBps(
      "10001",
    ),
  "PWRC_SERVICE_FEE_BPS_INVALID",
);

if (
  assertSolanaAddress(
    "11111111111111111111111111111111",
  ) !==
  "11111111111111111111111111111111"
) {
  failures.push(
    "solana-address",
  );
}

expectThrow(
  () =>
    assertSolanaAddress(
      "not-an-address",
    ),
  "PWRC_SOLANA_ADDRESS_INVALID",
);

const quote =
  buildFeeQuote({
    amount:
      1_000n *
      1_000_000_000n,
    operation:
      "bridge-solana-to-sui",
    serviceEnabled:
      true,
    serviceBps:
      250,
    serviceRecipient:
      "11111111111111111111111111111111",
    ttlMs:
      30_000,
    now:
      Date.parse(
        "2026-08-14T04:00:00.000Z",
      ),
  });

if (
  quote.serviceFeeNetBaseUnits !==
    "25000000000" ||
  !/^[a-f0-9]{64}$/.test(
    quote.quoteFingerprint,
  ) ||
  quote.issuedAt !==
    "2026-08-14T04:00:00.000Z" ||
  quote.expiresAt !==
    "2026-08-14T04:00:30.000Z"
) {
  failures.push(
    "fee-quote-integrity",
  );
}

const quoteAgain =
  buildFeeQuote({
    amount:
      1_000n *
      1_000_000_000n,
    operation:
      "bridge-solana-to-sui",
    serviceEnabled:
      true,
    serviceBps:
      250,
    serviceRecipient:
      "11111111111111111111111111111111",
    ttlMs:
      30_000,
    now:
      Date.parse(
        "2026-08-14T04:00:00.000Z",
      ),
  });

if (
  quoteAgain.quoteFingerprint !==
    quote.quoteFingerprint
) {
  failures.push(
    "fee-quote-not-deterministic",
  );
}

const limiter =
  createFixedWindowRateLimiter({
    limit:
      2,
    windowMs:
      1_000,
  });

if (
  limiter("a", 0)
    .allowed !== true ||
  limiter("a", 1)
    .allowed !== true ||
  limiter("a", 2)
    .allowed !== false ||
  limiter("a", 1_001)
    .allowed !== true
) {
  failures.push(
    "rate-limiter",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      tests: {
        strictAmounts:
          true,
        strictOperations:
          true,
        serviceRecipientAddress:
          true,
        quoteFingerprint:
          true,
        quoteExpiry:
          true,
        rateLimit:
          true,
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
