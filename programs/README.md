# PowerChain Solana Programs

Version: `1.0.0`

## Active program

`programs/pwrc-lock` is the active PowerChain application program in the Cargo
and Anchor workspace.

It implements the canonical PWRC lock/release boundary used by the Sui bridge.

Canonical PWRC itself remains a Token-2022 mint and does not require a custom
program for ordinary transfers.

## Deprecated fee router

`programs/pwrc-fees` is retained only as historical/compatibility source.

It is:

- excluded from the Cargo workspace;
- not listed in `Anchor.toml`;
- not a Mainnet program dependency;
- not part of canonical PWRC transfer semantics.

Canonical PWRC has **no transfer fee**.

## Deployment IDs

The ID under `[programs.localnet]` in `Anchor.toml` is a local-development
identity only.

Devnet/Mainnet IDs must be written only after actual build, deployment,
executable-account verification, and release-evidence generation.
