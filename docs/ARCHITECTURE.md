# Architecture

## Overview

PowerChain separates canonical asset logic, bridge accounting, chain-specific
programs, API/runtime orchestration, browser presentation, and release
authorization.

```text
                  ┌─────────────────────┐
                  │  Browser / apps/web │
                  └──────────┬──────────┘
                             │ same-origin /api/*
                             ▼
                  ┌─────────────────────┐
                  │      apps/api       │
                  │ quote/status/auth   │
                  └───────┬─────┬───────┘
                          │     │
                read-only │     │ server-only execute
                          │     ▼
                          │  External executor/signing boundary
                          │
          ┌───────────────┴────────────────┐
          │ Canonical runtime/config layer │
          │ src/common + utils + config    │
          └───────┬───────────────┬────────┘
                  │               │
                  ▼               ▼
       Solana Token-2022       Sui Move wPWRC
       PWRC + pwrc-lock        wrapped representation
```

## Canonical asset

PWRC is canonical on Solana. `wPWRC` is only the bridged representation on Sui.

Canonical constants are defined in `config/token.json` and mirrored by
dependency-free release/runtime constants where appropriate.

## Solana components

### Token-2022 asset

The canonical mint uses the Token-2022 program and requires:

- `TransferFeeConfig`
- `MetadataPointer`
- `TokenMetadata`

The native transfer fee is 250 bps with a 1,000,000 PWRC cap.

### `programs/token`

Verification-oriented Anchor program for canonical token state and extension
policy.

### `programs/pwrc-lock`

Bridge-side Solana program responsible for canonical lock/release semantics.

Local/development program IDs must not be treated as verified Mainnet IDs.

## Sui components

`contracts/wpwrc` contains the Sui Move package for the wrapped representation,
bridge controller/state and related errors/events.

The Sui package identity, coin type and controller object require actual
deployment evidence.

## Runtime TypeScript

`packages/protocol/src/common/` owns canonical TypeScript runtime implementations such as:

- retry policy;
- timeout handling;
- validation;
- Token-2022 units/fees;
- URL policy;
- atomic file writes;
- configuration helpers;
- serialization;
- error handling.

`packages/protocol/src/utils/` is the stable typed re-export layer.

## Dependency-free Node utilities

Root `packages/runtime/src/` contains release/build/runtime helpers used by `.mjs` scripts:

- canonical JSON;
- SHA-256;
- atomic JSON;
- environment parsing;
- config loading;
- safe process execution;
- logging/redaction;
- network validation;
- address validation;
- time/freshness checks;
- repository path validation.

## Full-stack applications

`apps/api` provides the HTTP control plane.

`apps/client` is a quote/status application using a same-origin reverse proxy.
Execution is intentionally server-to-server.

## Release architecture

The release system separates source readiness from deployment authorization.

```text
SOURCE_READY
→ BUILD_READY
→ EVIDENCE_READY
→ AUTHORIZED
→ CONSUMED
```

Artifacts and evidence are bound using SHA-256 and Ed25519 signatures. A release
authorization is short-lived and one-time.

## Data ownership

| Concern | Owner |
|---|---|
| Token constants | `config/token.json` |
| Bridge accounting policy | `config/bridge.json` |
| API/web runtime defaults | `config/apps.json` |
| Retry/finality policy | `config/runtime.json`, `config/transactions.json` |
| Mainnet release inputs | `config/mainnet/*` + generated reports |
| Runtime TypeScript primitives | `packages/protocol/src/common/` |
| Node/release primitives | `packages/runtime/src/` |
| API transport | `apps/api/` |
| Browser UI/proxy | `apps/client/` |
| Solana programs | `programs/` |
| Sui Move package | `contracts/wpwrc/` |
