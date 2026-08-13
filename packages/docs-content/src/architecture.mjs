export default {
  "slug": "architecture",
  "title": "System Architecture",
  "icon": "\u25a6",
  "category": "Architecture",
  "description": "Application boundaries, service topology, runtime supervision and configuration ownership.",
  "sections": [
    {
      "title": "Service Topology",
      "paragraphs": [
        "PowerChain runs the API and web application as separate processes with an explicit supervisor. The API becomes healthy before the web process is started."
      ],
      "code": {
        "language": "text",
        "code": "Browser\n   \u2502\n   \u25bc\nPowerChain Web\n127.0.0.1:3000\n   \u2502 same-origin API proxy\n   \u25bc\nPowerChain API\n127.0.0.1:8787"
      }
    },
    {
      "title": "Full-stack Supervisor",
      "items": [
        "Checks requested ports before spawning children.",
        "Starts API first and waits for /api/v1/health.",
        "Starts web only after API readiness.",
        "Supports opt-in automatic free-port selection.",
        "Performs coordinated SIGTERM shutdown."
      ]
    },
    {
      "title": "Configuration Boundaries",
      "paragraphs": [
        "Configuration files define policy. Environment variables own deployment-specific and sensitive runtime values."
      ],
      "code": {
        "language": "text",
        "code": "config/\n\u251c\u2500\u2500 token.json\n\u251c\u2500\u2500 bridge.json\n\u251c\u2500\u2500 apps.json\n\u251c\u2500\u2500 metadata-sources.json\n\u251c\u2500\u2500 toolchain.json\n\u2514\u2500\u2500 mainnet/"
      }
    },
    {
      "title": "Readiness Separation",
      "code": {
        "language": "text",
        "code": "source correctness\n\u2260 build readiness\n\u2260 deployment evidence\n\u2260 release authorization\n\u2260 Mainnet deployment"
      },
      "callout": {
        "title": "Evidence boundary",
        "body": "A passing source validation is not proof that any contract, package or token program has been deployed.",
        "tone": "warning"
      }
    }
  ]
};
