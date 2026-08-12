# PowerChain PWRC Token Verifier

**Package:** `pwrc-token`  
**Version:** `1.0.0`

`programs/token/` is a verification-only Anchor package for the canonical
PowerChain PWRC Token-2022 mint. It does not replace Token-2022, does not create
a second supply, and exposes no public mint instruction.

## Canonical PWRC profile

| Field | Value |
|---|---|
| Name | PowerChain |
| Symbol | PWRC |
| Canonical mint | `PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc` |
| Token program | Token-2022 |
| Decimals | `9` |
| Fixed supply | `18,446,000,000 PWRC` |
| Fixed supply base units | `18,446,000,000,000,000,000` |
| Transfer fee | `250 bps` / `2.5%` |
| Maximum transfer fee | `1,000,000 PWRC` |
| Maximum fee base units | `1,000,000,000,000,000` |
| On-chain metadata URI | `https://powerchain.energy/metadata/metaplex.json` |
| Public metadata JSON | `https://token.powerchain.energy/metadata/metadata.json` |

Required extensions:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

Forbidden extra canonical extensions include permanent delegate, mint-close
authority, default-frozen state, interest-bearing configuration, scaled UI
amount, pausable, and non-transferable behavior.

## Verification instruction

The public program surface is intentionally small:

```text
verify_canonical_mint
```

It verifies the supplied mint account against the canonical policy, including:

- Token-2022 account ownership;
- canonical mint address;
- exactly 9 decimals;
- exact fixed supply;
- revoked mint authority;
- null freeze authority;
- exact required extension set;
- both older/newer transfer-fee schedules at 250 bps;
- both schedules capped at 1,000,000 PWRC.

The verifier never exposes `mint_to` or a public mint path.

## Fee authority evidence

`TransferFeeConfig` includes authority-bearing state. Source code does not guess
or hardcode Mainnet fee authority custody. Release readiness must independently
verify the actual on-chain transfer-fee config authority and
`withdraw_withheld_authority` and confirm the intended governance policy.

## Metadata

Repository images:

```text
public/assets/pwrc.png
public/assets/wpwrc.png
```

Canonical metadata:

```text
https://powerchain.energy/metadata/metaplex.json
https://token.powerchain.energy/metadata/metadata.json
```

The metadata describes PWRC as a utility/governance token for the PowerChain
ecosystem, including tokenized renewables and real-world-asset use cases.
Metadata claims do not replace on-chain mint-state verification.

## Local verifier identity

The configured verifier program ID in `Anchor.toml` is a local/development
identity. It is not a Mainnet deployment claim.

Devnet/Mainnet program IDs must come from an actual built/deployed executable
program and release evidence.

## Static checks

```bash
pnpm token:check
pnpm token:manifest:check
pnpm token:metadata:check
pnpm token:production:check
pnpm token:readiness
pnpm idl:token:check
pnpm pwrc:fees
```

## Build and test

With the required Anchor/Rust/Solana toolchain installed:

```bash
pnpm token:build
pnpm token:test
```

A passing static verifier does not prove that the program compiled, that the
canonical mint exists on Mainnet, or that its current authority/fee state has
been verified.
