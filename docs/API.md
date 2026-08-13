# PowerChain Platform API

**Version:** `1.0.0`  
**Default URL:** `http://127.0.0.1:8787`  
**OpenAPI:** `openapi/powerchain.v1.json`

The API is the server-side control plane for canonical token information,
Mainnet readiness, fee-aware bridge quotes and tightly gated execution.

## Common response behavior

JSON routes return:

- `Cache-Control: no-store`;
- `X-Request-Id`;
- defensive content/security headers;
- rate-limit headers.

Request IDs are bounded safe ASCII. If a supplied request ID is invalid, the
server generates one.

## Health

### `GET /api/v1/health`

Process liveness.

This endpoint does not assert Mainnet deployment readiness.

## Readiness

### `GET /api/v1/ready`

Returns source/runtime readiness plus build/evidence/authorization state.

A code-ready repository may return HTTP 200 while `readyForMainnet` is false.
Those are different concepts.

## Version

### `GET /api/v1/version`

Returns API and repository version.

## Token profile

### `GET /api/v1/token`

Returns the canonical PWRC profile, including:

```text
mint      PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
decimals  9
fee       250 bps
fee cap   1000000 PWRC
```

## Metrics

### `GET /api/v1/metrics`

Returns bounded process-local counters and uptime.

Metrics intentionally exclude private keys, credentials, wallet material and
request bodies.

## Mainnet status

### `GET /api/v1/mainnet/status`

Runs/reads the fail-closed Mainnet release status.

Ordinary reads use a short status cache. Monetary execution requests a fresh
status.

## Bridge capabilities

### `GET /api/v1/bridge/capabilities`

Reports quote availability, executor configuration and whether execution is
currently possible.

`execute: false` is expected until all Mainnet and executor gates pass.

## Bridge quote

### `POST /api/v1/bridge/quote`

Request:

```json
{
  "direction": "solana-to-sui",
  "amountBaseUnits": "1000000000"
}
```

Directions:

```text
solana-to-sui
sui-to-solana
```

The amount is an integer string in base units. Zero and negative values are
rejected.

The server computes:

```text
fee = min(ceil(gross × 250 / 10000), 1_000_000 PWRC)
```

Example for `1,000,000,000` base units:

```text
gross  1,000,000,000
fee       25,000,000
net      975,000,000
```

The response includes a 64-character deterministic SHA-256 quote fingerprint.

## Bridge execute

### `POST /api/v1/bridge/execute`

This is a server-to-server endpoint.

Required headers:

```text
Authorization: Bearer <PWRC_BRIDGE_API_AUTH_TOKEN>
Idempotency-Key: <safe unique operation key>
Content-Type: application/json
```

Required body fields include:

```json
{
  "direction": "solana-to-sui",
  "amountBaseUnits": "1000000000",
  "destinationAddress": "0x...",
  "quoteFingerprint": "<64 hex>"
}
```

Execution requires all of:

1. Mainnet release status is ready;
2. execution adapter is explicitly enabled;
3. inbound bearer token is configured and valid;
4. idempotency key is valid;
5. quote is recomputed and fingerprint matches;
6. destination address is valid for the destination chain;
7. external executor URL/key are configured.

### Destination validation

Solana → Sui:

```text
0x + 64 hexadecimal characters
```

Sui → Solana:

```text
base58 address decoding to 32 bytes
```

### Idempotency

Before the external executor is contacted, the request is canonicalized and
hashed. The key is atomically reserved.

Reuse behavior:

| Existing state | Same request | Result |
|---|---|---|
| none | yes | reserve and execute |
| reserved/ambiguous | yes | reconciliation required |
| succeeded | yes | stored success may be replayed |
| failed | yes | conflict/previous failure |
| any | different request | idempotency conflict |

### Ambiguous outcomes

The API treats these as ambiguous:

- executor timeout;
- transport/network failure;
- executor 5xx.

It does not blindly retry because the executor may have received the monetary
operation.

## Execution status

### `GET /api/v1/bridge/executions/{idempotencyKey}`

Authenticated server-to-server reconciliation/status lookup.

## Status codes

Common codes:

```text
200  successful read / replayed terminal success
202  execution accepted/completed by configured executor
400  invalid request
401  execution authentication failure
404  route or execution record not found
405  known route with wrong method
409  quote/idempotency/reconciliation conflict
413  request body too large
415  JSON content type required
429  rate limit exceeded
502  ambiguous upstream/network executor failure
503  execution/Mainnet/auth configuration not ready
504  ambiguous executor timeout
```

## CORS

CORS is opt-in through `PWRC_API_ALLOWED_ORIGIN`. Monetary execution headers are
not enabled by the default browser CORS path. The browser app should use the
same-origin web proxy.
