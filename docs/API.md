# PowerChain Token API

**PowerChain release:** `1.0.0`  
**API version:** `v1`  
**OpenAPI:** `3.1.0`  
**Write model:** read-only public API

The PowerChain API exposes canonical PWRC/wPWRC identity, policy, metadata,
fees, asset registry data, bridge quotes, verification state and release
status. It does not expose wallet signing, transaction submission, minting,
bridge settlement writes, program deployment, Sui publication or release
authorization.

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

`/api/v1` returns the machine-readable route registry.

`/swagger` is the built-in dependency-free endpoint explorer. It supports route
search and tag filtering and links directly to the canonical Token and Assets
APIs.

Canonical specifications:

```text
swagger/openapi.json
swagger/openapi.yaml
swagger/swagger.yaml
swagger.yaml
```

## PowerChain Token API

Canonical namespace:

```text
GET /api/v1/token
GET /api/v1/token/
```

The response identifies itself as `PowerChain Token API` and returns the
canonical PWRC profile plus discovery links for the token-specific API.

Token resources:

```text
GET /api/v1/token/policy
GET /api/v1/token/description
GET /api/v1/token/metadata
GET /api/v1/token/fees
GET /api/v1/token/transfer-policy
GET /api/v1/token/utility-policy
GET /api/v1/token/native-policy
GET /api/v1/token/native-verification
GET /api/v1/token/native-attestation
```

Canonical PWRC:

```text
Name       PowerChain
Symbol     PWRC
Mint       PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Standard   Token-2022
Decimals   9
Supply     18,446,000,000 PWRC
```

All token identity/economic responses are bound to:

```text
POWERCHAIN_PWRC_TOKEN_POLICY_V1
cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4
```

Compatibility routes remain available:

```text
GET /api/v1/metadata
GET /api/v1/fees/policy
```

New clients should prefer the token-scoped aliases.

## Assets API

Canonical namespace:

```text
GET /api/v1/assets
GET /api/v1/assets/
GET /api/v1/assets/{symbol}
```

The canonical registry currently contains exactly:

```text
PWRC     Solana mainnet-beta   canonical Token-2022 asset
wPWRC    Sui mainnet           wrapped PWRC representation
```

Examples:

```text
GET /api/v1/assets/PWRC
GET /api/v1/assets/wPWRC
```

Symbol matching is case-insensitive. Unknown assets return `404`; malformed
symbols return `400`.

Each asset response includes canonical/wrapped classification, chain/network,
standard, decimals, supply/backing fields, metadata/image identity,
Token-2022 extensions where applicable, and the canonical token-policy SHA.

The Assets API is configuration/policy-derived and does not infer exchange
listing, liquidity or deployment state.

## Fees

Token-scoped route:

```text
GET /api/v1/token/fees
```

Compatibility route:

```text
GET /api/v1/fees/policy
```

Quote endpoint:

```text
GET /api/v1/fees/quote
  ?amountBaseUnits=<integer>
  &operation=<operation>
```

The native Token-2022 fee comes from canonical token policy. The optional
PowerChain service fee remains a separate operation-level source debit.

## Bridge

```text
GET /api/v1/bridge/status

GET /api/v1/bridge/quote/solana-to-sui
  ?amountBaseUnits=<integer>

GET /api/v1/bridge/quote/sui-to-solana
  ?amountBaseUnits=<integer>
```

Bridge APIs expose planning/status only. No monetary or administrative bridge
write route is public.

## Network and release

```text
GET /api/v1/network
GET /api/v1/devnet/status
GET /api/v1/release/status
GET /api/v1/status
```

Mainnet release lifecycle:

```text
SOURCE_READY
BUILD_READY
EVIDENCE_READY
AUTHORIZED
CONSUMED
```

API visibility of a source program or asset identity is not deployment evidence.

## Indexed Solana data

```text
GET /api/v1/data/solana/pwrc/transfers
GET /api/v1/data/solana/pwrc/volume
GET /api/v1/data/solana/pwrc/instructions
GET /api/v1/data/solana/pwrc/transfer-context
GET /api/v1/data/solana/wallet/transfers
```

These are read-only fixed-template data endpoints. Client-supplied raw SQL is
not accepted.

## SDK

```ts
const api = createPowerChainApiClient({
  baseUrl: "https://example.invalid",
});

await api.token();
await api.tokenPolicy();
await api.tokenMetadata();
await api.tokenFees();

await api.assets();
await api.asset("PWRC");
await api.asset("wPWRC");
```

The SDK validates asset symbols locally before constructing the detail request.

## Errors

Errors use a stable envelope:

```json
{
  "error": "PWRC_ERROR_CODE",
  "errorCode": "PWRC_ERROR_CODE",
  "requestId": "..."
}
```

Asset-specific examples:

```text
PWRC_ASSET_SYMBOL_INVALID
PWRC_ASSET_NOT_FOUND
PWRC_ASSET_REGISTRY_POLICY_MISMATCH
```

## Contract validation

```bash
pnpm token:api:v1:check
pnpm token:api:v1:test:source
pnpm openapi:check
pnpm api:endpoints:check
node scripts/production/test-api-contract.mjs
```

The OpenAPI checker compares registered routes, methods, tags and operation IDs
against `swagger/openapi.json`. Runtime/API/Swagger drift fails production
validation.


## Token Console

The lightweight client at `apps/client` presents the Token API, Assets API,
transfer-safety policy and fee quote surfaces in a responsive read-only console.

Primary UI sections:

```text
Overview
Assets
Safety
Fees
API explorer
```

The Safety section reads `/api/v1/token/transfer-policy` and presents preflight,
simulation, report-integrity and wallet-ownership boundaries without exposing a
signing or submission action.

UI source validation:

```bash
pnpm client:uiux:check
pnpm client:uiux:test:source
```


### Cacheable representations

Stable token, metadata, fee-policy and asset resources use strong SHA-256
ETags computed from the exact serialized response body. Request-scoped tracing
metadata is intentionally kept out of cacheable JSON bodies and returned in the
`x-request-id` response header instead.

Conditional requests support `If-None-Match`, including comma-separated
validators, wildcard matching and weak-validator comparison for GET/HEAD.
Matching resources return `304 Not Modified` with `ETag`, `Cache-Control` and
`x-request-id` headers.

```bash
pnpm api:cache-etag:check
pnpm api:cache-etag:test:source
```


### Rate-limit response metadata

The API emits token-bucket metadata such as:

```text
x-ratelimit-policy
x-ratelimit-limit
x-ratelimit-remaining
x-ratelimit-reset
```

Provider-backed expensive routes also receive a tighter
`x-expensive-ratelimit-*` policy. A rejected request returns `429` with a
refill-derived `Retry-After` value.

The implementation is process-local; these headers do not claim a distributed
quota across replicas.

### Token description resource

```text
GET /api/v1/token/description
```

Returns the canonical professional PWRC description, short/compact variants,
utility categories, renewable-energy-related digital infrastructure use case,
disclaimer, and deterministic description commitment.

```text
Domain  POWERCHAIN_PWRC_TOKEN_DESCRIPTION_V1
SHA-256 786cf50005186f88da572a666add55ad43a682bb7ac6d8cd433fd01e55e614e5
```
