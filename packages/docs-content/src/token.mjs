export default {
  "slug": "token",
  "title": "PWRC Token",
  "icon": "\u25ce",
  "category": "Protocol",
  "description": "Canonical PWRC Token-2022 monetary profile, supply, extensions and transfer-fee semantics.",
  "sections": [
    {
      "title": "Canonical Identity",
      "specs": [
        [
          "Network",
          "Solana mainnet-beta"
        ],
        [
          "Standard",
          "SPL Token-2022"
        ],
        [
          "Symbol",
          "PWRC"
        ],
        [
          "Decimals",
          "9"
        ],
        [
          "Canonical mint",
          "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
        ]
      ]
    },
    {
      "title": "Supply Policy",
      "specs": [
        [
          "Genesis supply",
          "18,446,000,000 PWRC"
        ],
        [
          "Maximum supply",
          "18,446,000,000 PWRC"
        ],
        [
          "Base units",
          "18,446,000,000,000,000,000"
        ],
        [
          "Freeze authority",
          "null"
        ]
      ],
      "callout": {
        "title": "Integer accounting",
        "body": "Canonical monetary calculations use bigint/base units rather than floating-point token values.",
        "tone": "info"
      }
    },
    {
      "title": "Token-2022 Extensions",
      "items": [
        "TransferFeeConfig",
        "MetadataPointer",
        "TokenMetadata"
      ],
      "paragraphs": [
        "These extensions are part of the required canonical profile. PermanentDelegate, MintCloseAuthority, DefaultAccountState, InterestBearingConfig, ScaledUiAmount, Pausable and NonTransferable are forbidden."
      ]
    },
    {
      "title": "Transfer Fee",
      "specs": [
        [
          "Basis points",
          "250 bps"
        ],
        [
          "Percentage",
          "2.5%"
        ],
        [
          "Maximum fee",
          "1,000,000 PWRC"
        ],
        [
          "Maximum fee base units",
          "1,000,000,000,000,000"
        ]
      ],
      "code": {
        "language": "text",
        "code": "gross amount\n\u2212 Token-2022 transfer fee\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nnet credited amount"
      }
    }
  ]
};
