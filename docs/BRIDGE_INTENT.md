# PowerChain Bridge Intent

Version: `1.0.0`

`wPWRC` is the **wrapped bridged representation** of canonical PWRC.

## Bridge policy

- canonical asset: **PWRC** on Solana
- canonical decimals: **9**
- wrapped asset: **wPWRC**
- wrapped network: **Sui**
- wrapped decimals: **6**
- backing: **1:1 backed by PWRC**
- wrapped supply must not exceed locked canonical PWRC
- canonical and wrapped metadata are separate

## Decimal conversion

The economic ratio is 1:1 in whole-token/UI units:

```text
1 PWRC = 1 wPWRC
```

The base-unit ratio differs because the assets use different decimals:

```text
1 PWRC             = 1,000,000,000 canonical base units
1 wPWRC            =     1,000,000 wrapped base units
1 wrapped base unit =        1,000 canonical base units
```

Therefore Solana -> Sui bridge amounts must be exactly divisible by 1,000
canonical base units. Amounts with finer precision cannot be represented by
the 6-decimal Sui asset and are rejected rather than rounded.

## Backing invariant

All conservation checks normalize wPWRC into canonical PWRC base units:

```text
effective wrapped exposure in canonical units
=
(wPWRC supply base units × 1000)
+ pending Solana -> Sui canonical base units
- pending Sui -> Solana canonical base units

effective wrapped exposure <= locked canonical PWRC
```

wPWRC maximum base-unit supply is:

```text
18,446,000,000,000,000
```

which represents 18,446,000,000 wPWRC at 6 decimals.

## Canonical vs wrapped metadata

PWRC metadata and wPWRC metadata are intentionally independent. wPWRC metadata
identifies it as a Sui wrapped asset, while canonical metadata continues to
identify PWRC as a 9-decimal Solana Token-2022 asset.

Validate metadata with:

```bash
pnpm pwrc:metadata:validate
```

Validate the bridge policy with:

```bash
pnpm pwrc:bridge:intent-check
```

## Pending semantics

Both pending values are nonnegative. `pendingSolanaToSui` is finalized canonical PWRC already locked but not yet minted on Sui. `pendingSuiToSolana` is finalized wPWRC already burned but not yet released on Solana. With these definitions both are added to circulating wPWRC when reconciling against the locked canonical vault.
