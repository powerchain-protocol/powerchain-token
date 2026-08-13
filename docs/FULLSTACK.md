# Full-Stack Applications

## Applications

```text
apps/api
apps/web
```

Both packages are workspace members and remain at version `1.0.0`.

## API

The API exposes:

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

The API does not trust a browser-supplied monetary quote. It recomputes the
canonical Token-2022 fee and produces a deterministic SHA-256 fingerprint.

### Runtime protections

Configured defaults from `config/apps.json`:

| Setting | Value |
|---|---:|
| JSON body limit | 65536 bytes |
| API request timeout | 30000 ms |
| Executor timeout | 20000 ms |
| Read limit | 120 requests/minute/client |
| Write limit | 30 requests/minute/client |
| Mainnet status cache | 2000 ms |
| Execution default | disabled |
| Idempotency directory | `runtime/api-idempotency` |

Execution forces a fresh Mainnet readiness check instead of relying on cached
status.

## Durable execution idempotency

`Idempotency-Key` is required for monetary execution.

The server stores a request hash and execution state under
`runtime/api-idempotency/`.

```text
reserved
├── succeeded
├── failed
└── ambiguous
```

A key reused for different request content returns a conflict. `ambiguous`
requires reconciliation and is not blindly resent.

A successful record can be replayed from durable state without another executor
write.

## Executor boundary

The executor is a separate server-side boundary. Required configuration:

```text
PWRC_BRIDGE_EXECUTION_ENABLED=true
PWRC_BRIDGE_API_AUTH_TOKEN=<server-to-server inbound token>
PWRC_BRIDGE_EXECUTOR_URL=<https URL>
PWRC_BRIDGE_EXECUTOR_API_KEY=<server-only key>
```

Even with those configured, execution remains disabled unless Mainnet release
status is ready.

Transport failure, timeout, or executor 5xx is classified as ambiguous because
the API cannot prove the executor did not receive the operation.

## Web application

`apps/client` serves static UI assets and proxies `/api/*` to the configured API.

Browser responsibilities:

- health/status display;
- canonical token profile;
- Mainnet readiness display;
- bridge capability display;
- bridge quote form.

Browser non-responsibilities:

- custody;
- private keys;
- executor credentials;
- bridge signing;
- authenticated monetary execution.

## Same-origin proxy

Default target:

```text
http://127.0.0.1:8787
```

Non-local production targets must be HTTPS. Credential-bearing URLs are
rejected.

Proxy requests have bounded bodies and timeout handling.

## Start

```bash
pnpm fullstack:start
```

Separate:

```bash
pnpm app:api
pnpm app:web
```

## Validate

```bash
pnpm fullstack:check
pnpm fullstack:runtime-test
pnpm fullstack:test
```
