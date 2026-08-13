# @powerchain/api

PowerChain `1.0.0` server API.

```bash
pnpm app:api
```

The application exposes health/readiness, canonical PWRC configuration,
Mainnet release status, fee-aware bridge quotes, bridge capabilities, and a
server-only execution adapter.

Execution is disabled by default and requires Mainnet readiness plus explicit
server-only authentication and executor configuration. No private keys are
stored or consumed by this app.


Runtime hardening includes per-client read/write rate limits, a short Mainnet
status cache, process-local metrics, chain-specific destination validation and
durable idempotency records. Execution always refreshes Mainnet readiness before
reserving the idempotency key and contacting the external executor.

```bash
pnpm fullstack:runtime-test
pnpm fullstack:test
```
