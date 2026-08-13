export default {
  "slug": "bridge",
  "title": "Bridge & wPWRC",
  "icon": "\u21c4",
  "category": "Cross-chain",
  "description": "Solana \u2194 Sui bridge semantics, wrapped supply accounting and conservation invariants.",
  "sections": [
    {
      "title": "wPWRC Representation",
      "specs": [
        [
          "Network",
          "Sui"
        ],
        [
          "Type",
          "Coin<WPWRC>"
        ],
        [
          "Decimals",
          "9"
        ],
        [
          "Genesis supply",
          "0"
        ],
        [
          "Conversion",
          "1 base unit PWRC = 1 base unit wPWRC"
        ]
      ]
    },
    {
      "title": "Solana to Sui",
      "code": {
        "language": "text",
        "code": "gross PWRC\n\u2212 Token-2022 fee\n= net canonical backing\n= wPWRC minted"
      }
    },
    {
      "title": "Sui to Solana",
      "paragraphs": [
        "wPWRC is burned on Sui before canonical PWRC is released on Solana. The Solana destination transfer then applies the native Token-2022 transfer fee."
      ],
      "code": {
        "language": "text",
        "code": "wPWRC burned\n= gross PWRC released\n\u2212 Token-2022 fee\n= net PWRC received"
      }
    },
    {
      "title": "Conservation Invariant",
      "code": {
        "language": "text",
        "code": "wrapped exposure =\n  circulating wPWRC\n+ pending Solana \u2192 Sui\n+ pending Sui \u2192 Solana\n\nwrapped exposure <= net spendable PWRC bridge backing"
      },
      "callout": {
        "title": "Fail closed",
        "body": "Any undercollateralized or unverifiable bridge state blocks execution rather than attempting recovery by assumption.",
        "tone": "danger"
      }
    }
  ]
};
