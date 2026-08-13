# PowerChain → Sui wPWRC Specification

Version: `1.0.0`

| Field | Canonical configuration |
|---|---|
| Project | PowerChain |
| Canonical token | **PWRC** |
| Wrapped Sui token | **wPWRC** |
| Canonical chain | **Solana mainnet-beta** |
| Sui role | Bridged representation |
| PWRC standard | Solana **Token-2022** |
| wPWRC standard | Sui Move `Coin<WPWRC>` |
| Decimals | **9** |
| Fixed canonical supply | **18,446,000,000 PWRC** |
| Base units | `18446000000000000000` |
| Initial Sui wPWRC supply | **0 wPWRC** |
| Exchange ratio | **1 PWRC = 1 wPWRC** |
| Version | **1.0.0** |

PWRC on Solana is the only canonical fixed supply. wPWRC starts at zero and
exists only as a 1:1 Sui bridge representation.

Canonical Token-2022 requires:

- `TransferFeeConfig`
- `MetadataPointer`
- `TokenMetadata`

The native transfer fee is **250 bps (2.5%)**, capped at **1,000,000 PWRC** per
Solana transfer. Permanent delegate, mint-close authority, default-frozen state,
interest-bearing extension, scaled UI amount, pausable, and non-transferable
extensions remain forbidden.

The configured Sui identity is:

```text
alias = powerchain
address = 0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1
```

This is an address alias/configuration value and must not be assumed to be the
wPWRC package ID without deployment evidence.

The canonical Move layout is:

```text
contracts/wpwrc/
├── Move.toml
└── sources/
    ├── wpwrc.move
    ├── bridge.move
    ├── state.move
    └── errors.move
```

Bridge minting is authority-gated, zero genesis supply is preserved, and every
authenticated message hash is permanently consumed to prevent replay.

Because both assets use 9 decimals, bridge accounting uses the same base-unit
domain:

```text
PWRC_locked =
wPWRC_circulating
+ pending_Solana_to_Sui
+ pending_Sui_to_Solana
```


## Fee-aware bridge boundary

The economic backing remains 1:1 in the common 9-decimal base-unit domain, but
Solana Token-2022 transfers are fee-bearing.

For Solana → Sui:

```text
gross PWRC transfer
- Token-2022 transfer fee
= net PWRC credited as bridge backing
= wPWRC minted
```

For Sui → Solana:

```text
wPWRC burned
= gross PWRC released from bridge backing

gross release
- Token-2022 transfer fee
= net PWRC received by the Solana destination
```

This prevents minting wPWRC against fee-withheld PWRC that is not spendable
bridge backing.
