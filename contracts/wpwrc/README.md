# wPWRC Sui Bridge Package

Version `1.0.0`.

`wPWRC` is the 9-decimal Sui bridge representation of canonical Solana PWRC.
It starts with zero supply and uses a 1:1 base-unit ratio.

## Capability model

`TreasuryCap<WPWRC>` is wrapped inside the shared `BridgeController` during
module initialization. The publisher does not receive an unrestricted
address-owned mint capability.

The controller starts paused and unconfigured. After publish, configure a
reviewed bridge authority and a distinct governor before unpausing.

## Replay protection

- Solana → Sui mint messages use `consumed_mint_messages`.
- Sui → Solana burn references use `consumed_burn_references`.
- Canonical quarterly burn evidence uses `processed_canonical_burns`.

## Canonical burn ceiling

The controller tracks the canonical live-supply ceiling in the same 9-decimal
base-unit domain. Quarterly canonical burn intent must be staged while paused
before the Solana burn, then the ceiling may only be lowered after finalized
burn evidence.

## Development build

```bash
sui move build --path contracts/wpwrc
sui move test --path contracts/wpwrc
```

The development `Move.toml` uses a moving Sui framework branch. Mainnet build
is intentionally blocked until that revision is replaced with a reviewed
immutable Git commit.
