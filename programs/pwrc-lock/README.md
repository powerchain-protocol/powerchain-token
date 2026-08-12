# `pwrc-lock`

**Version:** `1.0.0`

Active Anchor bridge-custody program for canonical 9-decimal PWRC on Solana and
9-decimal wPWRC on Sui.

## Canonical PWRC requirements

Bridge initialization/operation is bound to the canonical Token-2022 profile:

```text
Canonical mint:        PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals:              9
Fixed supply:          18,446,000,000 PWRC
Mint authority:        revoked
Freeze authority:      null
Transfer fee:          250 bps / 2.5%
Maximum transfer fee:  1,000,000 PWRC
```

`TransferFeeConfig` is required and its active fee schedules must match the
canonical policy.

## Fee-aware lock flow

A Token-2022 transfer into the bridge vault is fee-bearing. The bridge therefore
records the **net spendable amount credited to custody** as the wrapped amount:

```text
gross_amount = user-requested PWRC transfer
fee          = canonical Token-2022 transfer fee
wrapped      = gross_amount - fee
locked       = wrapped
```

The resulting wPWRC mint amount must equal `wrapped`, not the gross transfer.
Token-2022 fee-withheld units are not spendable bridge backing.

## Sui → Solana release flow

A finalized Sui burn releases a gross canonical amount equal to the wPWRC
burned. The Token-2022 transfer to the destination then applies the normal fee:

```text
wPWRC burned = gross PWRC released
recipient net = gross release - Token-2022 fee
```

## Replay and identity binding

Release evidence binds at least:

- unique Sui burn reference;
- Sui transaction digest;
- finalized checkpoint;
- amount;
- authenticated recipient owner;
- bridge configuration/deployment context.

Each accepted reference must be consumed exactly once.

## Governance

The bridge starts paused. Operator/governor rotation is two-step and pause-gated
with explicit cancellation paths. Production deployments should use separated,
reviewed governance identities rather than a single hot key.

## Vault safety

Initialization requires an empty canonical bridge vault. Source/destination
validation prevents using the vault itself as an ordinary transfer endpoint.

## Build and test

With the qualified Solana/Anchor toolchain installed:

```bash
anchor build --program-name pwrc_lock
cargo test -p pwrc-lock
```

Or through the workspace:

```bash
pnpm program:build
pnpm program:test
pnpm pwrc:solana:program-check
```

The local program ID in `Anchor.toml` is development-only. Mainnet program/vault
identities remain unresolved until independently built, deployed, executable
account verified, and release-attested.
