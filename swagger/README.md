# PowerChain OpenAPI

The canonical API contract is:

```text
swagger/openapi.json
swagger/openapi.yaml
```

OpenAPI version: `3.1.0`  
PowerChain version: `1.0.0`

Runtime endpoints:

```text
GET /api/v1/openapi.json
GET /swagger/openapi.yaml
```

`pnpm openapi:check` compares the OpenAPI document against
`apps/api/lib/api-registry.mjs` and fails on missing paths, mismatched
operation IDs, duplicate operation IDs, undocumented OpenAPI routes, or
public write methods.
