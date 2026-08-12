# @powerchain/native-token-client

Version: `1.0.0`

Exact TypeScript helpers for canonical PowerChain PWRC on Solana.

## Canonical profile

```text
Network:     Solana mainnet-beta
Program:     Token-2022
Decimals:    9
Supply:      18,446,000,000 PWRC
Transfer fee: none
```

The client provides exact bigint amount parsing/formatting, checked Token-2022
transfers, mint verification, Solana address validation, bounded JSON-RPC
helpers, and Solscan URL generation.

`./fees` remains only as a compatibility export and always resolves the
canonical PWRC transfer fee to zero.

## Commands

```bash
pnpm --filter @powerchain/native-token-client check
pnpm --filter @powerchain/native-token-client build
```
