# Production and Mainnet

Version: `1.0.0`

The Mainnet release state machine is forward-only: **SOURCE_READY → BUILD_READY → EVIDENCE_READY → AUTHORIZED → CONSUMED**. `readyForMainnet` is true only while all build/evidence/authorization gates pass and the authorization is still unused.

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


## Release authorization and replay safety

Deployment verification and release authorization are separate gates. Mainnet
evidence must include independent Solana/Sui RPC observations and an Ed25519
signature over the canonical evidence digest.

A second, short-lived Ed25519 release authorization binds the canonical mint,
networks, evidence hash, provenance hash, build-manifest hash, nonce, issue time,
and expiration time. The authorization nonce is consumed atomically at the
point of no return and cannot be reused.
