# PowerChain Platform API

Version `1.0.0`.

The full-stack API is implemented by `apps/api` using Node's HTTP runtime and
the same canonical token, fee, Mainnet status, hashing, environment and
security utilities used by the repository release tooling.

## Start

From the repository root:

```bash
pnpm app:api
```

Default endpoint:

```text
http://127.0.0.1:8787
```

The browser app should normally talk to the API through the same-origin proxy
in `apps/web` rather than calling port `8787` directly.

## Routes

```text
GET  /api/v1/health
GET  /api/v1/ready
GET  /api/v1/version
GET  /api/v1/token
GET  /api/v1/metrics
GET  /api/v1/mainnet/status
GET  /api/v1/bridge/capabilities
POST /api/v1/bridge/quote
POST /api/v1/bridge/execute
GET  /api/v1/bridge/executions/{idempotencyKey}
```

`POST /api/v1/bridge/quote` is server-owned. The request supplies a direction
and integer base-unit amount. The server recalculates the canonical native
Token-2022 transfer fee and returns a deterministic quote fingerprint.

`POST /api/v1/bridge/execute` is intentionally **not a browser endpoint**.
Execution requires all of the following:

1. `readyForMainnet === true`;
2. `PWRC_BRIDGE_EXECUTION_ENABLED=true`;
3. an HTTPS `PWRC_BRIDGE_EXECUTOR_URL`;
4. server-only `PWRC_BRIDGE_EXECUTOR_API_KEY`;
5. server-only inbound `PWRC_BRIDGE_API_AUTH_TOKEN`;
6. `Authorization: Bearer ...`;
7. a safe `Idempotency-Key`;
8. a server-recomputed quote matching any supplied quote fingerprint.

The API never blindly retries an executor request. If the external write may
have landed but the HTTP result times out, the API returns
`PWRC_BRIDGE_EXECUTION_AMBIGUOUS_TIMEOUT`; the operation must be reconciled by
the idempotency key rather than resubmitted.

The OpenAPI document is `openapi/powerchain.v1.json`.

## Request policy

- JSON request bodies are capped at 64 KiB.
- Request IDs are bounded safe ASCII.
- CORS is opt-in using `PWRC_API_ALLOWED_ORIGIN`.
- Direct cross-origin execution headers are not enabled by the default CORS
  policy.
- Security headers and `Cache-Control: no-store` are emitted for JSON routes.
- API logs pass through root structured redaction.

## Mainnet status

The API does not invent deployment readiness. `/api/v1/mainnet/status` refreshes
the repository's fail-closed status checker and exposes its actual blockers.


## Runtime protections

The API has independent read/write fixed-window limits with bounded in-memory
cardinality. Defaults are 120 reads/minute and 30 writes/minute per remote
address.

```text
PWRC_API_READ_RATE_LIMIT_PER_MINUTE=120
PWRC_API_WRITE_RATE_LIMIT_PER_MINUTE=30
```

Mainnet status is cached for two seconds for ordinary read endpoints. Monetary
execution explicitly requests a fresh Mainnet status before proceeding.

Execution requires `destinationAddress` and the exact 64-character quote
fingerprint. Destination validation is chain-specific:

- Solana → Sui requires a 32-byte Sui `0x...` address.
- Sui → Solana requires a base58 Solana address decoding to 32 bytes.

Before contacting the external executor, the API atomically reserves the
`Idempotency-Key` under `runtime/api-idempotency`. The record survives process
restart and moves through:

```text
reserved
→ succeeded
→ failed

reserved
→ ambiguous
```

`ambiguous` is intentionally non-terminal. A repeated request using the same
key is rejected with `PWRC_EXECUTION_RECONCILIATION_REQUIRED` until the
operation is reconciled. Reusing the key with different request content is
rejected with `PWRC_IDEMPOTENCY_KEY_CONFLICT`.

A successful terminal record is replayable without sending another monetary
write. Status can be queried through the authenticated execution-status route.

Executor HTTP 5xx responses, network transport failures, and timeouts are
treated as ambiguous because the API cannot prove the monetary operation did
not reach the executor.

`GET /api/v1/metrics` exposes only bounded process-local counters and uptime; it
does not expose secrets, wallet material, or request bodies.
