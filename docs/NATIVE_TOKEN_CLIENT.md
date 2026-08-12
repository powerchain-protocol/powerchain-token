# Native Token Client

PWRC/wPWRC both use 9 decimals, 1:1 base units, and zero transfer fee. The client validates addresses, exact bigint amounts, Token-2022 mint state, checked transfers, RPC reads, bridge intents, and Sui balances. `assertPwrcMint` rejects `TransferFeeConfig`.
