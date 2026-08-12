# wPWRC Sui Client

Version: `1.0.0`

## Supply policy

wPWRC has:

```text
decimals:       6
genesis supply: 0
issuance:       bridge-only
```

The Move initializer does not mint wPWRC. The TreasuryCap remains encapsulated
inside `BridgeController`, and new wPWRC is created only by
`mint_from_bridge` after a verified canonical PWRC lock.

There is no independent public standalone mint flow.

## Units

Bridge claims record the source amount in canonical 9-decimal PWRC base units.

Before building the Sui mint:

```text
wrapped amount =
canonical amount / 1000
```

The conversion must be exact. Rounding is forbidden.

Use `buildWpwrcMintFromBridgeClaim` instead of manually constructing a mint
transaction.

## Accounts

`client/sui/accounts.ts` uses the transport-independent Sui Core API:

- `getWpwrcBalance`
- `listWpwrcCoinObjects`
- `assertWpwrcCoinMetadata`
- `wpwrcCoinType`
- `assertSuiAddress`

Balances cover both Sui coin objects and address balances.

## Deployment

Before publishing:

```bash
pnpm wpwrc:zero-genesis
pnpm pwrc:sui:identity
```

After writing a deployment manifest:

```bash
pnpm wpwrc:update-config:testnet
```

or:

```bash
pnpm wpwrc:update-config:mainnet
```

The deployment manifest records 6 decimals, zero genesis supply, bridge-only
minting, and the 1000:1 base-unit conversion.
