export default {
  "slug": "security",
  "title": "Security Model",
  "icon": "\u25c7",
  "category": "Security",
  "description": "Fail-closed execution, transaction safety, URL/address validation and release evidence controls.",
  "sections": [
    {
      "title": "Fail-closed Policy",
      "items": [
        "Unknown deployment identity \u2192 reject",
        "Invalid destination \u2192 reject",
        "Expired quote \u2192 reject",
        "Quote fingerprint mismatch \u2192 reject",
        "Mainnet not ready \u2192 reject",
        "Ambiguous previous execution \u2192 reconcile",
        "Missing execution authentication \u2192 reject",
        "Undercollateralized bridge \u2192 reject"
      ]
    },
    {
      "title": "Write Safety",
      "paragraphs": [
        "Chain writes use at most one submission attempt. An ambiguous response is reconciled against chain state instead of blindly resubmitted."
      ],
      "code": {
        "language": "text",
        "code": "submit\n \u251c\u2500 confirmed \u2192 success\n \u2514\u2500 ambiguous\n      \u2514\u2500 reconcile\n          \u251c\u2500 finalized \u2192 recover\n          \u251c\u2500 failed    \u2192 fail\n          \u2514\u2500 unknown   \u2192 reconciliation required"
      }
    },
    {
      "title": "Input Validation",
      "items": [
        "Solana destinations must decode to 32-byte public keys.",
        "Sui addresses use canonical 0x + 64 hexadecimal format.",
        "Production RPC requires HTTPS.",
        "Production WebSocket requires WSS.",
        "URLs reject credentials, control characters and fragments."
      ]
    },
    {
      "title": "Release Evidence",
      "paragraphs": [
        "Source readiness, build readiness, deployment evidence, authorization and authorization consumption are modeled as separate sequential gates."
      ],
      "code": {
        "language": "text",
        "code": "SOURCE_READY\n  \u2193\nBUILD_READY\n  \u2193\nEVIDENCE_READY\n  \u2193\nAUTHORIZED\n  \u2193\nCONSUMED"
      }
    }
  ]
};
