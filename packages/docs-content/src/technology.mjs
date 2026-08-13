export default {
  "slug": "technology",
  "title": "Technology Overview",
  "icon": "\u25c8",
  "category": "Platform",
  "description": "Technology stack, runtime architecture and core engineering principles behind PowerChain.",
  "sections": [
    {
      "title": "Technology Overview",
      "lead": "PowerChain is a cross-chain digital asset infrastructure stack built around canonical PWRC on Solana and wPWRC on Sui.",
      "paragraphs": [
        "The platform separates monetary policy, bridge accounting, execution, evidence, metadata and application services into explicit modules. The design goal is deterministic and auditable execution rather than implicit runtime behavior."
      ],
      "items": [
        "Canonical asset ownership remains explicit.",
        "Monetary values use integer base units.",
        "Write operations are never blindly retried.",
        "Mainnet execution remains fail-closed until evidence and authorization gates are complete."
      ]
    },
    {
      "title": "Runtime Stack",
      "specs": [
        [
          "Node.js",
          "22.22.3 local compatibility baseline"
        ],
        [
          "pnpm",
          "10.21.0"
        ],
        [
          "TypeScript",
          "5.9.x"
        ],
        [
          "Modules",
          "Native ESM"
        ],
        [
          "Version",
          "1.0.0"
        ]
      ],
      "code": {
        "language": "text",
        "label": "Supported Node lanes",
        "code": ">=22.22.3 <23\n>=24.18.1 <25\n>=26.5.1 <27"
      }
    },
    {
      "title": "Application Layer",
      "paragraphs": [
        "The application layer is intentionally separated from protocol logic. Browser-facing code never receives bridge executor credentials, private signing material or Mainnet authorization evidence."
      ],
      "code": {
        "language": "text",
        "label": "Workspace",
        "code": "apps/\n\u251c\u2500\u2500 api/\n\u251c\u2500\u2500 web/\n\u2514\u2500\u2500 docs/\n\ncomponents/docs/\nsessions/"
      }
    },
    {
      "title": "Engineering Principles",
      "items": [
        "Security-first and fail-closed defaults",
        "Deterministic serialization and hashing",
        "Strict chain-specific address validation",
        "Durable idempotency for execution",
        "Evidence-backed Mainnet release states",
        "Repository policy independent of local IDE state"
      ]
    }
  ]
};
