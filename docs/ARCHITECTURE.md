# Architecture

PWRC is canonical on Solana. wPWRC is a Sui bridge representation.

```text
wallet
  ↓
client
  ↓
API quote / transaction review
  ↓
Solana Token-2022 principal transfer
  ├─ native transfer fee
  └─ net canonical backing
  ↓
bridge confirmation
  ↓
Sui wPWRC mint (net backing only)

optional service-fee transfer
  └─ separate PWRC transfer to reviewed service wallet
```

Application service fees are kept outside canonical token monetary policy and
outside wrapped backing accounting.
