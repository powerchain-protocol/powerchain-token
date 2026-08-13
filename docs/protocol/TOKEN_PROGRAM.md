# PowerChain PWRC Token Verifier

**Package:** `pwrc-token`  
**Version:** `1.0.0`

`programs/token/` is the production verification package for the canonical
PowerChain PWRC Token-2022 mint. It does not replace Token-2022, does not create
a second supply, and exposes no public mint instruction.

## Canonical PWRC profile

```text
Name                         PowerChain
Symbol                       PWRC
Canonical mint               PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Token program                Token-2022
Decimals                     9
Fixed supply                 18,446,000,000 PWRC
Fixed supply base units      18,446,000,000,000,000,000

Transfer fee                 250 bps / 2.5%
Maximum transfer fee         1,000,000 PWRC
Maximum fee base units       1000000000000000
Metadata URI                 https://powerchain.energy/metadata/metaplex.json
```

Required Token-2022 extensions:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

Forbidden extra canonical extensions include permanent delegate, mint-close
authority, default-frozen state, interest-bearing configuration, scaled UI
amount, pausable, and non-transferable behavior.

## Verification

`verify_canonical_mint` checks the supplied mint account directly and requires:

- Token-2022 ownership;
- canonical mint address;
- exactly 9 decimals;
- exact fixed supply;
- revoked mint authority;
- null freeze authority;
- exactly the required extension set;
- both current/next transfer-fee schedules at 250 bps;
- both schedules capped at 1,000,000 PWRC.

The transfer-fee configuration/withdraw authorities are deployment evidence and
are **not guessed in source**. Mainnet readiness remains blocked until those
authorities and their custody policy are verified.

## Local identity

The verifier's local development program ID is:

```text
HRrDxwZzuFreRmkCLY9oFXNGAy2gjd3diHyyTadxd8s6
```

It is not a Mainnet program ID.

## Checks

```bash
pnpm token:check
pnpm token:manifest:check
pnpm idl:token:check
pnpm pwrc:fees
pnpm pwrc:metadata:validate
```

Toolchain-dependent:

```bash
pnpm token:build
pnpm token:test
```

A static check is not proof of compilation or deployment.


## Metadata verification

`MetadataPointer` and `TokenMetadata` are required extensions. Production
verification also checks the canonical off-chain URI and supplied mint through
the client/configuration layer. The on-chain verifier rejects unexpected mint
extensions and validates the exact transfer-fee schedules.
