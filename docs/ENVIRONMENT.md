# Environment Variables

This document summarizes the primary runtime environment variables. Examples
exist in `.env.example`, `.env.production`, and `.env.mainnet.example`.

## API

| Variable | Purpose | Default |
|---|---|---|
| `PWRC_API_HOST` | Bind address | `127.0.0.1` |
| `PWRC_API_PORT` | API port | `8787` |
| `PWRC_API_ALLOWED_ORIGIN` | Optional browser CORS origin | unset |
| `PWRC_API_READ_RATE_LIMIT_PER_MINUTE` | Per-client read limit | `120` |
| `PWRC_API_WRITE_RATE_LIMIT_PER_MINUTE` | Per-client write limit | `30` |
| `PWRC_API_IDEMPOTENCY_DIR` | Durable execution state directory | `runtime/api-idempotency` |

## Web

| Variable | Purpose | Default |
|---|---|---|
| `PWRC_WEB_HOST` | Bind address | `127.0.0.1` |
| `PWRC_WEB_PORT` | Web port | `3000` |
| `PWRC_WEB_API_URL` | Server-side API proxy target | `http://127.0.0.1:8787` |

Non-local API targets must use HTTPS.

## Bridge execution

| Variable | Purpose | Default |
|---|---|---|
| `PWRC_BRIDGE_EXECUTION_ENABLED` | Enables the external execution adapter | `false` |
| `PWRC_BRIDGE_API_AUTH_TOKEN` | Inbound server-to-server bearer token | unset |
| `PWRC_BRIDGE_EXECUTOR_URL` | HTTPS executor endpoint | unset |
| `PWRC_BRIDGE_EXECUTOR_API_KEY` | Executor API credential | unset |

All four execution requirements are server-side. Do not expose them to browser
bundles.

## RPC and chain deployment values

The repository contains additional Solana/Sui RPC, network and deployment
variables in the example environment files and chain-specific scripts.

Production Mainnet RPC URLs must satisfy the HTTPS/WSS policies enforced by the
runtime.

## Secret handling

Never commit:

- private keys;
- wallet seeds;
- mnemonics;
- bearer tokens;
- API keys;
- signing secrets;
- database credentials.

Structured logging redacts common secret-like fields, but redaction is not a
license to intentionally log secrets.

## Boolean syntax

Root environment parsing accepts:

```text
true:  1, true, yes
false: 0, false, no
```

Invalid values fail instead of silently coercing.

## Integer syntax

Integer environment variables use strict integer parsing and safe-integer
bounds. Floating-point strings and unsafe integers are rejected.
