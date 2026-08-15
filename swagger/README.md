# PowerChain OpenAPI

**PowerChain release:** `1.0.0`  
**OpenAPI:** `3.1.0`

Canonical API documents:

```text
swagger/openapi.json
swagger/openapi.yaml
```

Compatibility alias:

```text
swagger/swagger.yaml
```

Runtime contract routes:

```text
GET /api/v1/openapi.json
GET /swagger/openapi.yaml
```

Important token routes include:

```text
GET /api/v1/token
GET /api/v1/token/policy
GET /api/v1/token/native-policy
GET /api/v1/token/native-verification
GET /api/v1/token/native-attestation
GET /api/v1/token/transfer-policy
```

Validate with:

```bash
pnpm openapi:check
pnpm api:endpoints:check
node scripts/production/test-api-contract.mjs
```

The OpenAPI/registry gates check route coverage, operation IDs and public write
surfaces. Token and bridge monetary/admin endpoints remain read-only.
