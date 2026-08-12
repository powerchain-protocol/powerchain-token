# Production and Mainnet

Version: `1.0.0`

Release states are distinct: **static-ready**, **build-ready**,
**deployment-ready**, and **Mainnet-ready**.

## Solana

Bridge initialization requires the canonical PWRC Token-2022 mint, 9 decimals,
validated supply/authority state, distinct operator/governor identities, and an
empty canonical bridge vault.

Canonical PWRC requires `TransferFeeConfig`, `MetadataPointer`, and
`TokenMetadata`. The transfer fee is 250 bps (2.5%) capped at 1,000,000 PWRC.
Mainnet release evidence must verify both transfer-fee schedules and the
transfer-fee config/withdraw-withheld authority custody.

## Sui

The wPWRC package creates zero genesis supply, encapsulates
`TreasuryCap<WPWRC>` in the shared `BridgeController`, starts paused, and
requires one-time authority configuration before unpause.

The Move package uses edition `2024` and does not declare the Sui framework as
an explicit git dependency. The reviewed build must generate
`contracts/wpwrc/Move.lock`; release evidence binds that lockfile SHA-256 and
the Sui CLI version used for the build/publish workflow.

## Authenticated bridge verifier

Mainnet stays blocked until the Solana release authority and Sui bridge
authority are backed by reviewed authenticated bridge/verifier evidence.
Replay protection is required but does not by itself authenticate the source
chain event.

## Build and release phases

```bash
pnpm pwrc:mainnet:prebuild
pnpm mainnet:build
```

After actual deployment identities and chain evidence have been populated:

```bash
pnpm mainnet:release:check
```

No Mainnet identity is synthesized by the build or readiness scripts.
