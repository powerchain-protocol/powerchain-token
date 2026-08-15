# PowerChain OpenAPI / Swagger

**PowerChain release:** `1.0.0`  
**API:** `v1`  
**OpenAPI:** `3.1.0`

Canonical documents:

```text
swagger/openapi.json
swagger/openapi.yaml
```

Compatibility aliases:

```text
swagger/swagger.yaml
swagger.yaml
```

Runtime specification routes:

```text
GET /api/v1/openapi.json
GET /api/v1/openapi.yaml
GET /swagger/openapi.yaml
GET /swagger/swagger.yaml
GET /swagger.yaml
```

Interactive lightweight explorer:

```text
GET /swagger
```

The built-in explorer is dependency-free and provides route search, tag
filtering, route counts and direct links to the Token and Assets APIs.

## Token API

```text
GET /api/v1/token
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

## Assets API

```text
GET /api/v1/assets
GET /api/v1/assets/{symbol}
```

Canonical asset symbols are `PWRC` and `wPWRC`.

The OpenAPI asset schemas are closed (`additionalProperties: false`) and bind
responses to the canonical PWRC token-policy SHA.

## Validation

```bash
pnpm token:api:v1:check
pnpm openapi:check
pnpm api:endpoints:check
node scripts/production/test-api-contract.mjs
```

The contract is intentionally GET-only for public token/asset/bridge monetary
surfaces. Swagger documentation does not imply Mainnet deployment, exchange
listing, liquidity or transaction-submission capability.
