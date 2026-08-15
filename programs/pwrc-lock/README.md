# PWRC Lock Program

**Version:** `1.0.0`

The bridge-lock program is the Solana-side state/authority boundary.

The current source starts bridge state paused and separates governor-controlled
pause state. The final Mainnet program ID is not populated until a reviewed
program keypair, qualified build, deployment and independent RPC evidence
exist.

## Build

```bash
anchor build --program-name pwrc_lock
cargo test -p pwrc-lock
```

## Deployment

Devnet:

```bash
PWRC_DEVNET_DEPLOY_ENABLED=true \
PWRC_LOCK_PROGRAM_ID_DEVNET=<reviewed-program-id> \
PWRC_LOCK_PROGRAM_KEYPAIR=/secure/path/pwrc-lock.json \
PWRC_TOKEN_PROGRAM_KEYPAIR=/secure/path/pwrc-token.json \
PWRC_DEVNET_DEPLOYER_KEYPAIR=/secure/path/deployer.json \
pnpm devnet:deploy:solana
```

Mainnet is separately gated and requires an explicit confirmation string.

## 1.0.0 administrative hardening

The Solana `pwrc-lock` source now tracks separate governor and operator roles,
starts paused, supports governor/operator rotation, emits administration events,
and exposes `verify_state`.

It intentionally does **not** expose PWRC mint or release instructions in this
source-ready artifact. Custody/settlement deployment must be backed by compiled
program artifacts and deployment evidence before Mainnet authorization.


## v29 administration hardening

Bridge administration state is now a singleton PDA derived from:

```text
["bridge-state"]
```

State contains:

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

Governor and operator must remain distinct. Governor transfer is two-step:

```text
transfer_governor(new_governor)
accept_governor()
```

The current governor may cancel a pending transfer with
`cancel_governor_transfer()`. A pending governor transfer blocks unpausing.
Successful governor acceptance forces `paused=true`.

`admin_sequence` increments on every accepted administrative mutation using
checked arithmetic.

This program still has no custody, lock, release, mint, burn, or token-transfer
instruction. Its presence does not prove that bridge custody is deployed.
