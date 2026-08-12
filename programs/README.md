# PowerChain Solana Programs

Version `1.0.0`.

## Active programs

`programs/pwrc-lock` implements the PWRC ↔ wPWRC bridge custody boundary.

`programs/token` is a verification-only Anchor program for the canonical PWRC
Token-2022 mint. It exposes no public mint path.

Canonical transfers use Token-2022 `TransferFeeConfig` directly at **250 bps
(2.5%)**, capped at **1,000,000 PWRC** per transfer.

## Deprecated fee router

`programs/pwrc-fees` remains deprecated and excluded. It is unnecessary because
the canonical fee is implemented by Token-2022 itself; there is no additional
custom protocol-router transfer fee.

## Deployment identities

Localnet IDs in `Anchor.toml` are development identities only. Devnet/Mainnet
program IDs are populated only after actual build, deployment, executable
account verification, and release evidence.
