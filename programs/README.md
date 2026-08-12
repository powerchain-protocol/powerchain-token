# PowerChain Solana Programs

**Version:** `1.0.0`

## Active programs

```text
programs/
├── pwrc-lock/     PWRC ↔ wPWRC bridge custody boundary
├── token/         canonical PWRC Token-2022 verifier
└── pwrc-fees/     deprecated custom fee-router source
```

## `pwrc-lock`

The bridge program escrows canonical PWRC on Solana and releases custody only
against authenticated, replay-protected Sui burn evidence.

Canonical PWRC transfers use Token-2022 `TransferFeeConfig` at **250 bps
(2.5%)**, capped at **1,000,000 PWRC** per transfer. Solana → Sui bridge
accounting therefore uses the **net spendable amount** credited to the vault as
wPWRC backing.

## `pwrc-token`

Verification-only Anchor program for the canonical PWRC mint. It exposes no
public mint instruction and validates:

- canonical mint identity;
- Token-2022 ownership;
- exact 9 decimals;
- exact fixed supply;
- revoked mint authority;
- null freeze authority;
- required extensions;
- canonical transfer-fee schedules.

## Deprecated custom fee router

`programs/pwrc-fees` is retained only for historical/source compatibility and is
excluded from the active deployment model.

PWRC **does use** a transfer fee, but that fee is native Token-2022
`TransferFeeConfig`. No separate custom protocol-router transfer fee should be
deployed for canonical `1.0.0`.

## Localnet identities

Program IDs in `Anchor.toml` are local/development identities unless explicitly
backed by deployment evidence. Devnet/Mainnet program IDs must be populated only
after actual build, deployment, executable-account verification, and release
attestation.

## Build and test

Bridge program:

```bash
anchor build --program-name pwrc_lock
cargo test -p pwrc-lock
```

Token verifier:

```bash
anchor build --program-name pwrc_token
cargo test -p pwrc-token
```

Workspace helpers:

```bash
pnpm production:build:solana
pnpm token:production:check
pnpm pwrc:solana:program-check
```

A static check is not proof that either program compiled or was deployed.
