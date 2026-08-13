# TypeScript, Packages, and Scripts

Version: `1.0.0`

## TypeScript configuration

The repository uses a layered configuration:

```text
tsconfig.base.json      shared strict compiler policy
tsconfig.json           repository-wide no-emit typecheck
tsconfig.build.json     runtime/client/package build inputs only
tsconfig.scripts.json   deployment/check script typecheck
tsconfig.tests.json     tests plus their runtime dependencies
```

The build configuration excludes tests and operational scripts.

Important strictness includes:

- `strict`;
- `noUncheckedIndexedAccess`;
- `exactOptionalPropertyTypes`;
- `noImplicitOverride`;
- `useUnknownInCatchVariables`;
- `verbatimModuleSyntax`;
- `isolatedModules`;
- NodeNext modules and resolution.

## Packages

The pnpm workspace is:

```text
packages/*
```

Current package:

```text
@powerchain/native-token-client@1.0.0
```

Package and root versions remain exactly `1.0.0`.

## Script groups

Repository-only checks:

```bash
pnpm pwrc:static
pnpm verify
```

TypeScript:

```bash
pnpm typecheck
pnpm typecheck:build
pnpm typecheck:scripts
pnpm typecheck:tests
pnpm build:ts
```

Packages:

```bash
pnpm packages:check
pnpm packages:build
pnpm pwrc:packages:check
pnpm pwrc:exports:check
```

Optional blockchain toolchain gates:

```bash
pnpm ci:solana
pnpm ci:sui
pnpm ci:full
```

The default `pnpm ci` does not pretend Anchor/Sui toolchains are installed.
Those are explicit additional gates.

## Canonical no-fee rule

`pnpm pwrc:fees` now validates that:

- `TransferFeeConfig` is required and must match the canonical 250 bps / 1,000,000 PWRC cap;
- protocol native Token-2022 transfer fee is enabled;
- Token-2022 native Token-2022 transfer fee is enabled;
- client transfer helpers use `TransferChecked`, not fee transfer instructions;
- mint verification rejects `TransferFeeConfig`.
