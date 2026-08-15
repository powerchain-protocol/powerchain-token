# PWRC Bridge Administration Program

**Canonical release:** `1.0.0`

`pwrc-lock` is the Solana bridge **administration/control-plane** boundary. It
is intentionally not a custody or settlement program.

Source program identity:

```text
7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr
```

This source identity must not be interpreted as verified Mainnet deployment
evidence.

## State model

Bridge administration state is a singleton PDA derived from:

```text
["bridge-state"]
```

State includes:

```text
governor
pending_governor
operator
paused
bump
admin_sequence
lock_sequence
release_sequence
```

The legacy lock/release sequence fields are state fields only; there are no
monetary lock or release instructions in this source.

## Governance

- state starts paused;
- governor/operator keys must be distinct before unpause;
- governor changes use propose/accept semantics;
- the current governor may cancel a pending transfer;
- a pending governor transfer blocks unpause;
- successful governor acceptance forces `paused = true`;
- accepted administrative mutations use checked `admin_sequence` increments;
- no-op administrative changes are rejected.

## Monetary capability

This program exposes **no** PWRC:

- custody;
- lock;
- release;
- mint;
- burn;
- token transfer.

A separate, compiled and independently verified settlement/custody
implementation would be required before claiming those capabilities.

## Build

When Rust/Anchor dependencies are available:

```bash
cargo fmt --check
cargo check -p pwrc-lock
cargo test -p pwrc-lock
anchor build --program-name pwrc_lock
```

Mainnet deployment requires compiled artifacts and independent deployment
evidence; source checks are not a substitute.
