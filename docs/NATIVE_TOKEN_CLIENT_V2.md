# PowerChain Native Token Client v2

Package version remains `1.0.0`.

The upgraded client is split into typed Solana, Sui, bridge, validation, and
shared type modules.

Canonical model:

```text
PWRC   Solana mainnet-beta / Token-2022 / 9 decimals
wPWRC  Sui bridged representation / 9 decimals
ratio  1:1 in base units
fee    none
```

The client provides strict Solana address/signature validation, Sui address and
coin-type validation, bounded JSON-RPC helpers, Token-2022 mint validation,
checked transfer instructions, Sui balance reads, bridge intent builders, and
Solscan helpers.

No 1000:1 conversion remains. `TransferFeeConfig` is rejected for canonical
PWRC.
