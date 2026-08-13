# Testing and Validation

PowerChain has several validation layers. They are not interchangeable.

## 1. Static production checks

```bash
pnpm production:check
```

Current packaged result:

```text
53 / 53 PASS
```

These checks inspect architecture, security rules, metadata, configs, scripts,
program source constraints, release policy and other source-level invariants.

## 2. Full-stack architecture

```bash
pnpm fullstack:check
```

Checks required API/web files, routes, security invariants, workspace membership
and application config.

## 3. Full-stack runtime primitives

```bash
pnpm fullstack:runtime-test
```

Covers:

- rate limiter;
- rate-limit window reset;
- TTL cache;
- durable idempotency reservation;
- conflict detection;
- ambiguous state handling;
- restart persistence.

## 4. Live full-stack integration

```bash
pnpm fullstack:test
```

Starts API/web on isolated ports and validates:

- health;
- canonical token profile;
- canonical 250-bps quote;
- same-origin proxy;
- capability gate;
- execution fail-closed behavior.

## 5. TypeScript

```bash
pnpm typecheck
pnpm typecheck:build
pnpm typecheck:scripts
pnpm typecheck:tests
```

These require installed dependencies. Syntax parsing alone does not prove
dependency-bound correctness.

## 6. Unit/regression tests

```bash
pnpm test
```

Specialized suites:

```bash
pnpm test:anchor
pnpm test:runtime-hardening
pnpm test:relayer-durability
pnpm test:mainnet-release-state
pnpm test:root-security
```

## 7. Solana

```bash
pnpm production:build:solana
pnpm program:test
pnpm token:test
```

These require the qualified Rust/Anchor/Solana dependency graph.

## 8. Sui

```bash
pnpm production:build:sui
```

This performs Move build and Move tests with the qualified Sui CLI.

## 9. Release provenance

```bash
pnpm release:provenance
pnpm release:provenance:verify
```

## 10. Mainnet release gates

```bash
pnpm mainnet:build-manifest:verify
pnpm mainnet:evidence:verify
pnpm mainnet:evidence:bindings-verify
pnpm mainnet:authorization:verify
pnpm mainnet:authorization:unused-check
pnpm pwrc:mainnet:status
pnpm pwrc:mainnet:preflight
```

These are expected to fail before real build/deployment evidence exists.

## CI

Common root CI commands:

```bash
pnpm ci
pnpm ci:full
pnpm ci:solana
pnpm ci:sui
```

`ci:full` should only be considered authoritative in an environment with all
required chain toolchains and dependencies installed.
