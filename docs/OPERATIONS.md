# PowerChain `1.0.0` Operations

PowerChain distinguishes read/service operations from monetary settlement.

## Read/service operations

Authentication, signed messages, health/status, metadata, discovery, price observations, quote previews, simulations, proofs and attestations may omit a token amount. Read-only provider calls may use bounded retry and timeout handlers.

## Monetary operations

Transfers, bridge settlement, swaps, fee settlement, x402 payment and checkout settlement require a strictly positive amount. A zero-value monetary settlement is rejected.

## Write handling

Production writes follow the same safety sequence:

1. validate configuration, addresses, amount and chain identity;
2. validate Token-2022 fee expectations when PWRC moves;
3. simulate when supported;
4. submit once;
5. confirm finality;
6. reconcile ambiguous outcomes using the returned signature or durable source reference;
7. only retry after idempotency/replay state proves a retry is safe.

`src/handlers/write-handler.ts` intentionally has no blind-retry loop.

## Replay and idempotency

Bridge replay and relayer idempotency keys use domain-separated SHA-256 values. Persistent implementations must implement atomic `reserve()` / insert-if-absent semantics; a `has()` followed by a separate insert is not sufficient for production concurrency.

## Cache and build cleanup

```bash
pnpm clean:cache
```

removes generated caches such as `.next`, `.turbo`, `.cache`, `coverage`, `dist` and selected Rust incremental data without touching source, deployment evidence or IDL baselines.
