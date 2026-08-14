# PowerChain Token API

**Version:** `1.0.0`  
**API:** `v1`  
**OpenAPI:** `3.1.0`

The API is intentionally read-only plus deterministic quote endpoints. It does
not expose bridge mint/release, Solana program deployment, Sui publication,
release authorization, or other monetary write operations.

## Discovery and Swagger

```text
GET /api/v1
GET /api/v1/openapi.json
GET /api/v1/openapi.yaml
GET /swagger
GET /swagger/openapi.yaml
GET /swagger/swagger.yaml
GET /swagger.yaml
```

`/api/v1` is the machine-readable route index. `/swagger` is the lightweight
human-readable endpoint explorer.

Canonical specifications are stored in:

```text
swagger/openapi.json
swagger/openapi.yaml
swagger/swagger.yaml
swagger.yaml
```

## System

```text
GET /api/v1/health
GET /api/v1/ready
GET /api/v1/version
GET /api/v1/status
GET /api/v1/platform
```

`health` is liveness. `ready` describes runtime readiness and does not imply
that Mainnet deployment is authorized. `/api/v1/status` aggregates runtime,
bridge, Devnet and Mainnet state.

## Token and network

```text
GET /api/v1/token
GET /api/v1/network
```

The canonical PWRC mint is:

```text
PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
```

## Fees

```text
GET /api/v1/fees/policy

GET /api/v1/fees/quote
  ?amountBaseUnits=<integer>
  &operation=<operation>
```

The policy endpoint separates PWRC's native Token-2022 transfer fee from the
optional PowerChain operation-level service fee.

## Bridge

```text
GET /api/v1/bridge/status

GET /api/v1/bridge/quote/solana-to-sui
  ?amountBaseUnits=<integer>
```

Bridge quote responses keep canonical locked backing and wPWRC mint base units
equal. No bridge write endpoint is exposed.

## Release status

```text
GET /api/v1/devnet/status
GET /api/v1/release/status
```

Mainnet states are:

```text
SOURCE_READY
BUILD_READY
EVIDENCE_READY
AUTHORIZED
CONSUMED
```

Only the existing release workflow can advance these states.

## Coinbase CDP indexed Solana data

```text
GET /api/v1/data/solana/pwrc/transfers
GET /api/v1/data/solana/pwrc/volume
GET /api/v1/data/solana/pwrc/instructions
GET /api/v1/data/solana/pwrc/transfer-context
GET /api/v1/data/solana/wallet/transfers
```

These are analytics/read endpoints backed by fixed server-side SQL templates.
Raw SQL is not accepted from clients.

## Error envelope

API errors use:

```json
{
  "error": "PWRC_ERROR_CODE",
  "errorCode": "PWRC_ERROR_CODE",
  "requestId": "..."
}
```

Responses include `x-request-id`, rate-limit headers and conservative security
headers.

## Contract drift

Run:

```bash
pnpm openapi:check
pnpm api:endpoints:check
```

The OpenAPI checker compares every registered API route, method, tag and
`operationId` against `swagger/openapi.json`. Adding a runtime route without
updating Swagger fails production validation.
