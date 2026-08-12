# Production Observability

PWRC 1.0.0 uses observable, bounded failure handling rather than silent retries.

## Provider health

Pyth, Birdeye, RPC, CCTP, and other read providers can be summarized into:

- healthy
- degraded
- unhealthy
- unknown

Health combines recent failure rate and p95 latency.

Settlement code should fail closed when a required provider is unhealthy.

## Retry discipline

Read operations may use bounded retry with exponential backoff.

Automatic retries are **not** a substitute for idempotency and must not be
blindly applied to writes. Solana protocol transfers use transaction-level and
receipt-PDA idempotency instead.

## Evidence

Quotes, provider observations, finalized transactions, and settlement outcomes
can be wrapped in deterministic SHA-256 evidence envelopes. Evidence supports a
previous-hash field so records can be hash chained.

Never include:

- private keys
- seed phrases
- raw authorization headers
- unrestricted AI prompts containing secrets

in evidence/log records.

## Production readiness

Run:

```bash
pnpm pwrc:readiness
```

The command writes `reports/production-readiness.json`.

Core blockers:

- missing verified canonical PWRC mint
- missing HTTPS mainnet RPC

Optional features such as Pyth, Birdeye, wPWRC bridge, and CCTP are reported
separately and do not falsely become "ready" just because template config files
exist.
