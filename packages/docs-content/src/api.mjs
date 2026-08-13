export default {
  "slug": "api",
  "title": "API Reference",
  "icon": "{ }",
  "category": "Developer",
  "description": "PowerChain v1 service endpoints, execution controls, rate limits and idempotency behavior.",
  "sections": [
    {
      "title": "HTTP Endpoints",
      "code": {
        "language": "http",
        "code": "GET  /api/v1/health\nGET  /api/v1/ready\nGET  /api/v1/version\nGET  /api/v1/token\nGET  /api/v1/metrics\nGET  /api/v1/mainnet/status\nGET  /api/v1/bridge/capabilities\nPOST /api/v1/bridge/quote\nPOST /api/v1/bridge/execute\nGET  /api/v1/bridge/executions/{idempotencyKey}"
      }
    },
    {
      "title": "Execution Controls",
      "items": [
        "Bearer authentication for server-owned execution",
        "Idempotency-Key required for writes",
        "Fresh Mainnet readiness check",
        "Server-side quote recomputation",
        "Quote fingerprint verification",
        "Destination validation",
        "Durable execution records"
      ]
    },
    {
      "title": "Rate Limits",
      "specs": [
        [
          "Read requests",
          "120 requests/minute/client"
        ],
        [
          "Write requests",
          "30 requests/minute/client"
        ],
        [
          "Exceeded response",
          "HTTP 429"
        ],
        [
          "Error code",
          "PWRC_RATE_LIMIT_EXCEEDED"
        ]
      ]
    },
    {
      "title": "Idempotency Semantics",
      "code": {
        "language": "text",
        "code": "same key + same request + succeeded \u2192 replay success\nsame key + different request       \u2192 reject conflict\nsame key + ambiguous state         \u2192 reconciliation required\nsame key + failed state            \u2192 reject previous failure"
      }
    }
  ]
};
