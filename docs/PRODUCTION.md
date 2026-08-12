# PowerChain `1.0.0` Production Operations

## Qualified configuration

The repository targets Node 22+, pnpm 11.20.0, Anchor 0.32.1 and the reviewed Agave/Solana 2.3.0 profile recorded in `config/toolchain.json`. A different toolchain requires a fresh Devnet qualification before Mainnet use.

## Canonical asset

```text
Mint:       PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Program:    Token-2022
Decimals:   9
Supply:     18,446,000,000 PWRC
Fee:        250 bps / 2.5%
Fee cap:    1,000,000 PWRC
Metadata:   https://token.powerchain.energy/metadata/metadata.json
```

The mint address is configured but remains `provided-not-onchain-verified` until a production RPC verification run records the exact Token-2022 state.

## Safe transaction policy

Read-only RPC operations may retry bounded transient failures. Chain writes are simulated, submitted once, confirmed at `finalized`, and never blindly retried. An ambiguous submission must be reconciled by signature or durable bridge idempotency state.

## Mainnet

Mainnet is fail-closed. A dedicated HTTPS Solana RPC, secondary RPC for release evidence, verified mint/program/vault identities, Token-2022 fee authorities, generated Anchor IDLs, normalized Sui modules, reviewed Move.lock/Sui CLI build evidence, governance separation and release evidence are required before `pwrc:mainnet:preflight` can pass.

Automated Mainnet mint creation is intentionally disabled in `scripts/deploy.sh`. The reviewed canonical mint is verified with:

```bash
PWRC_MAINNET_RPC_URL=https://... pnpm pwrc:mainnet:verify-existing
```

## Devnet

Devnet creation is allowed only when the installed `spl-token` CLI exposes transfer-fee creation options. The created mint is immediately checked against the required Token-2022 extension, supply and fee profile. A failed profile check invalidates that Devnet mint.

```bash
pnpm pwrc:devnet:status
pnpm pwrc:devnet:preflight
```

## Build gates

```bash
pnpm production:check
pnpm typecheck
pnpm test
pnpm production:build:solana
pnpm production:build:sui
```

Do not claim build, deployment or Mainnet readiness unless those gates actually run and pass on the release workstation.

## Build phase vs deployment phase

Production build and deployment evidence are deliberately separated so release
checks do not create a circular dependency.

```bash
pnpm pwrc:devnet:prebuild
pnpm devnet:build

pnpm pwrc:mainnet:prebuild
pnpm mainnet:build
```

`mainnet:build` does **not** require already-deployed program/package IDs. It
does require the reproducible dependency lockfile and production source/config
policy. After real deployment and chain verification, run:

```bash
pnpm mainnet:release:check
```

That final release gate requires deployment identities, authority evidence,
generated Anchor IDLs, normalized Sui module evidence, and Mainnet preflight.
