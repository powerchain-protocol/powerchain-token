# wPWRC — Sui Bridge Package

**Version:** `1.0.0`

`contracts/wpwrc/` contains the active Sui Move package for `wPWRC`, the Sui
bridge representation of canonical Solana PWRC.

## Asset model

```text
Canonical asset:     PWRC on Solana Token-2022
Wrapped asset:       wPWRC on Sui
Decimals:            9 / 9
Genesis wPWRC:       0
Base-unit factor:    1
Mint policy:         bridge-only
```

`wPWRC` does not introduce a second independent fixed supply. It represents
canonical PWRC held as bridge backing.

## Fee-aware bridge boundary

Canonical PWRC uses Token-2022 `TransferFeeConfig` at `250 bps` with a maximum
fee of `1,000,000 PWRC` per Solana transfer.

Solana → Sui therefore mints against **net spendable PWRC credited to bridge
backing**, not the gross transfer amount:

```text
gross PWRC
- Token-2022 transfer fee
= net bridge backing
= wPWRC minted
```

Sui → Solana burns a wPWRC amount equal to the **gross canonical release**.
The destination's Solana Token-2022 transfer then applies the normal fee.

## Capability model

`TreasuryCap<WPWRC>` is encapsulated inside the shared `BridgeController`.
The publisher does not receive an unrestricted address-owned mint capability.

The controller starts paused and unconfigured. A reviewed bridge authority and
a distinct governor must be configured before unpausing.

## Replay protection

The package maintains permanent replay protection for bridge operations:

- Solana → Sui mint messages use `consumed_mint_messages`;
- Sui → Solana burn references use `consumed_burn_references`;
- canonical quarterly burn evidence uses `processed_canonical_burns`.

Replay identifiers must be consumed atomically with the corresponding state
transition.

## Canonical burn ceiling

The bridge controller tracks the canonical live-supply ceiling in the common
9-decimal base-unit domain. Canonical quarterly burn intent is staged while the
bridge is paused, finalized against Solana burn evidence, reconciled, and only
then used to lower the Sui-side canonical supply ceiling.

PWRC and wPWRC use the same 9-decimal base-unit domain with base-unit factor `1`.

## Package identity

The configured `powerchain` address is an alias/configuration value, not proof
of the published package ID. Mainnet package/object IDs remain unresolved until
a real publish transaction and deployment evidence establish them.

## RPC environments

| Network | RPC |
|---|---|
| testnet | `https://fullnode.testnet.sui.io:443` |
| mainnet | `https://fullnode.mainnet.sui.io:443` |
| devnet | `https://fullnode.devnet.sui.io:443` |
| local | `http://127.0.0.1:9000` |

## Build and test

With the Sui CLI installed:

```bash
sui move build --path contracts/wpwrc
sui move test --path contracts/wpwrc
```

Or through the workspace scripts:

```bash
pnpm production:build:sui
```

The package uses Move edition `2024` with Sui framework resolution handled by
the Sui toolchain. Production requires a reviewed build-generated `Move.lock`,
its SHA-256 commitment, the Sui CLI version, and deployment evidence.

## Production readiness

Useful checks:

```bash
pnpm pwrc:wpwrc:spec-check
pnpm pwrc:sui:capability-check
pnpm wpwrc:zero-genesis
pnpm wpwrc:mainnet:readiness
pnpm idl:sui-normalized
```

Static success does not prove that the Sui package has been built, published,
or verified on Mainnet.
