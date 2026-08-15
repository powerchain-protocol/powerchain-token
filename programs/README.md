# PowerChain Solana Programs

**Canonical release:** `1.0.0`

This directory contains two deliberately separate Solana program surfaces.

## `programs/token`

Verification-only PWRC Token-2022 profile program.

```text
Program source identity
PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

It verifies canonical base-mint properties and emits an audit event. It has no
PWRC mint, burn, transfer, custody, release, or authority-mutation instruction.

## `programs/pwrc-lock`

Bridge administration/control-plane program.

```text
Program source identity
7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr
```

It maintains singleton `bridge-state` administration state, starts paused,
separates governor/operator roles, supports two-step governor transfer and uses
checked sequencing.

It is **not** a complete PWRC custody bridge and exposes no monetary
lock/release/mint/transfer instruction.

## Capability policy

```text
config/programs/policy.json
```

The policy records intended source/release capabilities and is not deployment
evidence.

## Build gates

When Rust/Anchor tooling and dependencies are installed:

```bash
cargo fmt --check
cargo check
cargo test
anchor build
anchor test
```

Do not claim a successful build or deployment from source/static checks alone.
A Mainnet program identity requires matching compiled artifact, keypair/public
identity and independently verified deployment evidence.
