# `@powerchain/native-token-client`

**Version:** `1.0.0`

Exact TypeScript helpers for canonical PowerChain PWRC on Solana Token-2022 and
fee-aware PWRC ↔ wPWRC bridge intent construction.

## Canonical profile

```text
Network:               Solana mainnet-beta
Token program:         Token-2022
Canonical mint:        PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals:              9
Fixed supply:          18,446,000,000 PWRC
Transfer fee:          250 bps / 2.5%
Maximum transfer fee:  1,000,000 PWRC
Metadata URI:          https://powerchain.energy/metadata/metaplex.json
```

## Client capabilities

The package provides:

- exact `bigint` amount parsing/formatting;
- canonical mint-address validation;
- Token-2022 mint verification;
- mint/freeze authority verification;
- `TransferFeeConfig` schedule validation;
- exact transfer-fee calculation with ceil-before-cap semantics;
- fee-aware `createTransferCheckedWithFeeInstruction` construction;
- Solana and Sui address validation;
- fee-aware bridge intent construction;
- bounded RPC helpers and explorer URL generation.

## Transfer fee calculation

The native Token-2022 fee is calculated as:

```text
fee = min(ceil(amount × 250 / 10,000), 1,000,000 PWRC)
net = amount - fee
```

There is no second custom protocol-router transfer fee.

## Bridge intent semantics

Solana → Sui:

```text
gross PWRC transfer
- Token-2022 fee
= net PWRC backing
= wPWRC amount
```

Sui → Solana:

```text
wPWRC burned
= gross PWRC release

gross PWRC release
- Token-2022 fee
= expected recipient net
```

## Mint verification

The canonical client validator checks the configured canonical mint and requires:

- Token-2022 ownership;
- 9 decimals;
- supply not above the fixed maximum;
- exact fixed genesis supply when requested;
- revoked mint authority when requested;
- null freeze authority;
- a present `TransferFeeConfig`;
- both fee schedules at 250 bps and the canonical cap.

Metadata-pointer/token-metadata extension verification is also enforced by the
repository's canonical token profile and on-chain verifier program.

## Commands

From the workspace root:

```bash
pnpm pwrc:client:check
pnpm pwrc:native-client:check
pnpm pwrc:client:bridge-check
```

When dependencies are installed:

```bash
pnpm --filter @powerchain/native-token-client check
pnpm --filter @powerchain/native-token-client build
```

Static validation is not proof of on-chain mint state.
