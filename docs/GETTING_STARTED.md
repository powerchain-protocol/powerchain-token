# Getting Started

PowerChain `1.0.0` is a pnpm workspace containing TypeScript/Node components,
Solana Anchor programs, Sui Move contracts, release tooling, and two wired
applications.

## Prerequisites

The repository pins the production JavaScript toolchain to:

```text
Node 22.22.3 compatibility baseline
pnpm 10.21.0
```

For complete chain builds you also need the repository-approved Solana/Anchor,
Rust/Cargo, and Sui CLI toolchains. The exact qualified versions are enforced by
the toolchain scripts and configuration in the repository.

Do not create placeholder lockfiles or generated chain artifacts to satisfy a
gate.

## Install

Use Corepack/pnpm with the pinned version:

```bash
corepack enable
corepack prepare pnpm@10.21.0 --activate
pnpm --version
```

Then install the workspace using the real dependency graph:

```bash
pnpm install
```

The repository uses explicit pnpm build approvals. Check them with:

```bash
pnpm pnpm:check
pnpm pnpm:ignored-builds
```

If required, review and approve only the expected dependency build scripts:

```bash
pnpm pnpm:approve-builds
```

## First repository checks

Run lightweight repository and security checks first:

```bash
pnpm pwrc:root:check
pnpm pwrc:root:platform-check
pnpm pwrc:security:hardening-check
pnpm fullstack:check
```

Then run the full static suite:

```bash
pnpm production:check
```

## Start the wired applications

Run both services together:

```bash
pnpm fullstack:start
```

or separately:

```bash
pnpm app:api
pnpm app:web
```

Defaults:

```text
API  http://127.0.0.1:8787
Web  http://127.0.0.1:3000
```

The web app proxies `/api/*` to the API. Browser JavaScript does not receive
bridge executor credentials.

## Validate the live stack

```bash
pnpm fullstack:runtime-test
pnpm fullstack:test
```

The live test launches isolated API/web processes and checks health, token
configuration, bridge quote math, same-origin proxy behavior, capability
gating, and fail-closed execution.

## TypeScript

With dependencies installed:

```bash
pnpm typecheck
pnpm typecheck:scripts
pnpm typecheck:tests
```

A syntax-only check is not a substitute for dependency-bound type checking.

## Solana build

```bash
pnpm pwrc:toolchain:solana
pnpm production:build:solana
```

This should produce real Anchor program binaries and generated IDLs. Do not
fabricate them when the toolchain is unavailable.

## Sui build

```bash
pnpm pwrc:toolchain:sui
pnpm production:build:sui
```

This runs Sui Move build and tests for `contracts/wpwrc`.

## Full production build

```bash
pnpm production:build
```

The production build composes repository checks, TypeScript/package builds,
Solana builds, IDL synchronization, and Sui build/tests.

## What local success does not mean

Local source checks do not establish a Mainnet deployment. Mainnet additionally
requires real generated binaries, lockfiles, generated IDLs, deployment
evidence, independent RPC observations, signed evidence, and a fresh one-time
release authorization.
