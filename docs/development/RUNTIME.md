# Runtime, Utilities and Handlers

Production runtime settings live in `config/runtime.json`, `config/transactions.json`, `config/handlers.json` and `config/production/policy.json`.

Reusable utilities are under `packages/protocol/src/common/` for URL validation, environment parsing, bounded retry, timeouts, bigint/u64 validation and domain-separated hashing. Read handlers may retry bounded transient failures; write handlers never blind-retry and require reconciliation.

Replay and relayer idempotency keys are SHA-256 domain-separated and stores expose atomic `reserve()` semantics to avoid check-then-insert races.
