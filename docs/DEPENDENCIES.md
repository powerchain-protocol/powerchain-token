# Dependency Policy

PWRC remains version `1.0.0`. Tooling dependencies are separate from the token version.

- pnpm is pinned through `packageManager`.
- Generate and commit `pnpm-lock.yaml` after the first trusted install.
- CI should then be changed to `pnpm install --frozen-lockfile`.
- Do not use `latest` dependency ranges in production.
- Review Solana CLI and SPL Token CLI release notes before a mainnet deployment.

## Lockfile requirement

The mainnet preparation script refuses to proceed without `pnpm-lock.yaml`. Generate the lockfile on a network-enabled development workstation, review it, and commit it before qualifying the exact release on devnet/mainnet. This archive does not fabricate a lockfile when package metadata cannot be resolved from the registry.

## Anchor compatibility client

PWRC 1.0.0 additionally pins the requested compatibility/client dependencies:

- `@coral-xyz/anchor` `0.32.1`
- `@solana/web3.js` `1.98.4`
- `bs58` `6.0.0`
- `axios` `1.19.0`

`@coral-xyz/anchor` is intentionally isolated to the TypeScript compatibility/test
client. The current Anchor 1.0 TypeScript package is named `@anchor-lang/core`, so
new Anchor-native application code should evaluate that migration separately rather
than silently changing this PWRC 1.0.0 compatibility surface.
