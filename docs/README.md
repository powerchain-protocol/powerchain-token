# PowerChain Documentation

**Version:** `1.0.0`

This directory documents the production model for canonical PWRC, wPWRC,
Token-2022 fees, bridge accounting, IDL/release policy, and Mainnet evidence.

## Start here

| Document | Purpose |
|---|---|
| `TOKEN_PROGRAM.md` | Canonical PWRC Token-2022 verifier and invariant policy |
| `TOKEN_ASSETS.md` | PWRC/wPWRC images, metadata URLs, and official product links |
| `WPWRC_SPECIFICATION.md` | Canonical PWRC → Sui wPWRC bridge representation |
| `PROGRAMS.md` | Solana/Sui on-chain program architecture |
| `BRIDGE_INTENT.md` | Bridge lifecycle, conservation, and replay boundaries |
| `INTEGRATION.md` | Production bridge integration lifecycle |
| `RELAYER_SECURITY.md` | Fail-closed relayer/security policy |
| `BURN_INTENT.md` | Quarterly canonical burn race protection |
| `IDL.md` | Expected/generated IDL contracts and ABI release gates |
| `PRODUCTION.md` | Build phases, toolchain gates, and production workflow |
| `PRODUCTION_MAINNET.md` | Mainnet build/deployment readiness requirements |
| `MAINNET_CHECKLIST.md` | Final Mainnet evidence checklist |
| `OPERATIONS.md` | Operational runbook and incident-safe workflows |
| `RELEASE_PROVENANCE.md` | Source/build/deployment evidence commitments |
| `SECURITY_MODEL.md` | Security model and authority boundaries |
| `OFFICIAL_LINKS.md` | Canonical PowerChain project links |

## Canonical token snapshot

```text
PWRC chain:             Solana mainnet-beta
PWRC standard:          Token-2022
PWRC mint:              PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
PWRC decimals:          9
PWRC fixed supply:      18,446,000,000
Transfer fee:           250 bps / 2.5%
Maximum transfer fee:   1,000,000 PWRC
wPWRC chain:            Sui
wPWRC decimals:         9
wPWRC genesis supply:   0
```

Required canonical Token-2022 extensions are `TransferFeeConfig`,
`MetadataPointer`, and `TokenMetadata`.

## Metadata and assets

```text
public/assets/pwrc.png
public/assets/wpwrc.png
metadata/metadata.json
metadata/wpwrc.metadata.json
```

Public metadata:

```text
https://token.powerchain.energy/metadata/metadata.json
```

On-chain metadata URI:

```text
https://powerchain.energy/metadata/metaplex.json
```

## Sui RPC environments

| Network | RPC endpoint | Production target |
|---|---|---:|
| testnet | `https://fullnode.testnet.sui.io:443` | |
| mainnet | `https://fullnode.mainnet.sui.io:443` | **✓** |
| devnet | `https://fullnode.devnet.sui.io:443` | |
| local | `http://127.0.0.1:9000` | |

Machine-readable configuration lives under `config/sui/`.

## Release principle

The repository distinguishes three states:

1. **static configuration/source valid**;
2. **toolchain-generated artifacts verified**;
3. **Mainnet deployment evidence verified**.

Passing static checks is not equivalent to a successful Anchor build, Sui Move
build, on-chain mint verification, or Mainnet deployment.

## Production runtime additions

- `TRANSACTIONS.md` — fee-aware transaction submission and reconciliation.
- `RUNTIME.md` — runtime config, retry/timeout utilities and handlers.
- `DEVNET.md` — Devnet readiness and fail-closed preflight.
- `NEXTJS.md` — optional Next.js host security baseline.

- `CONTRACTS.md` — active Solana/Sui contract roles and hardening.
