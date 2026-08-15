# PowerChain Sui Contracts

**Version:** `1.0.0`

`contracts/wpwrc` is the wrapped PowerChain bridge package.

```text
Name             Wrapped PowerChain
Symbol           wPWRC
Decimals         9
Genesis supply   0
Base-unit ratio  1:1 with canonical PWRC backing
Maximum exposure 18,446,000,000 PWRC base-unit equivalent
```

## Bridge controller

`BridgeController` owns the wPWRC `TreasuryCap` and starts paused. It separates:

- governor: configuration/pause/operator authority;
- operator: Solana→Sui bridge-mint authority;
- users: may burn owned wPWRC for a Solana release request.

Solana→Sui minting requires a unique 32-byte source-message digest. The
controller stores consumed message digests on-chain so the same bridge message
cannot mint twice.

Sui→Solana burns emit the burn sequence, Sui sender, 32-byte Solana recipient,
and exact base-unit amount. That event is evidence for the Solana-side release;
it does not itself release PWRC.

## Deployment identity

`wpwrc = "0x0"` in `Move.toml` is only a source placeholder.

Mainnet evidence must contain actual:

```text
package ID
coin type
BridgeController object ID
metadata capability ID/custodian
publish transaction
checkpoint
primary + secondary RPC verification
```

The configured `powerchain` Sui address is an alias/configuration value and is
not treated as a published package ID without publish evidence.

## Build / publish

```bash
sui move build --path contracts/wpwrc

WPWRC_DEVNET_PUBLISH_ENABLED=true \
pnpm sui:publish:devnet
```

Mainnet publication is separately confirmation-gated.

## wPWRC controller hardening

The wPWRC controller includes replay protection, a fixed maximum wrapped
exposure, paused-by-default initialization, governor/operator separation,
governor transfer, zero-address rejection, sequence views, and a consumed
message query.

`mint_from_solana` remains operator-gated and replay protected.
`burn_for_solana` burns wPWRC before any Solana release can be considered.
Finalized Sui evidence must still be independently verified by the Solana-side
settlement process.
