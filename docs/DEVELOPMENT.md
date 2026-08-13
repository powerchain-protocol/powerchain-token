# Development

## Version policy

The current product version is exactly `1.0.0`. Do not change package versions
as part of ordinary fixes or documentation updates.

## Ownership boundaries

Use these locations consistently:

```text
src/common/     canonical TypeScript runtime implementation
src/utils/      public typed re-exports
utils/          dependency-free Node/release primitives
config/         versioned policy/configuration
apps/api/       HTTP API
apps/client/       browser UI and same-origin proxy
client/         chain client implementation
packages/       reusable workspace packages
programs/       Solana programs
contracts/      Sui Move packages
scripts/        orchestration/build/release tooling
tests/          TypeScript regression tests
```

Avoid copying generic hash, URL, config, process, time, redaction or atomic-file
logic into individual scripts.

## Development loop

```bash
pnpm pwrc:root:check
pnpm pwrc:config:registry-check
pnpm pwrc:security:hardening-check
pnpm fullstack:check
pnpm typecheck
pnpm test
```

For fast API/web changes:

```bash
pnpm fullstack:start
```

## Source formatting and determinism

Cryptographic commitments use strict canonical JSON. Unsupported values such as
`undefined`, `BigInt`, non-finite numbers and cycles are rejected.

Do not use locale-dependent formatting or random values in deterministic
fingerprints.

## Monetary code

When changing monetary logic:

1. operate in integer base units;
2. avoid floating-point token math;
3. preserve 9 decimals;
4. preserve Token-2022 fee policy;
5. add exact test vectors;
6. avoid blind retries;
7. preserve idempotency/reconciliation behavior.

## API changes

Update all of:

```text
apps/api/
openapi/powerchain.v1.json
docs/API.md
scripts/production/check-fullstack.mjs
scripts/production/test-fullstack-live.mjs
```

If a route changes monetary semantics, add runtime tests as well.

## Config changes

Update the appropriate canonical config and run:

```bash
pnpm pwrc:config:registry-check
pnpm production:check
pnpm release:provenance
pnpm release:provenance:verify
```

## Chain program changes

Solana program changes require real Anchor/Rust compilation and tests.

Sui Move changes require real Sui build and tests.

Never claim generated IDLs, program binaries or Move lockfile validation unless
the real toolchain generated and verified them.
