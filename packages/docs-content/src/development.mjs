export default {
  "slug": "development",
  "title": "Development Guide",
  "icon": "\u2318",
  "category": "Developer",
  "description": "Local environment setup, validation commands, application startup and troubleshooting.",
  "sections": [
    {
      "title": "Bootstrap",
      "code": {
        "language": "bash",
        "code": "source scripts/bootstrap/activate-node.sh\npnpm install"
      },
      "specs": [
        [
          "Node",
          "v22.22.3"
        ],
        [
          "pnpm",
          "10.21.0"
        ]
      ]
    },
    {
      "title": "Validation",
      "code": {
        "language": "bash",
        "code": "pnpm pnpm:check\npnpm production:check\npnpm typecheck\npnpm test\npnpm fullstack:ports-test\npnpm fullstack:runtime-test\npnpm fullstack:test"
      }
    },
    {
      "title": "Start Applications",
      "code": {
        "language": "bash",
        "code": "# Full stack, strict default ports\npnpm start\n\n# Full stack, automatically select free local ports\npnpm start:auto\n\n# Docs application\npnpm start:docs"
      }
    },
    {
      "title": "Default Ports",
      "specs": [
        [
          "Web",
          "3000"
        ],
        [
          "Docs",
          "3002"
        ],
        [
          "API",
          "8787"
        ]
      ],
      "callout": {
        "title": "Port collisions",
        "body": "Use start:auto for local full-stack development when the default API or web port is already occupied.",
        "tone": "info"
      }
    }
  ]
};
