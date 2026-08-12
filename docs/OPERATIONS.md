# PWRC Operation Semantics

PWRC distinguishes **token settlement** from **protocol/service operations**.

## Zero-value operations that are valid

No token transfer is required for:

- Solana signed messages
- authentication challenges
- wallet ownership proofs
- service handshakes
- health/status checks
- metadata retrieval
- market discovery
- Pyth/Birdeye market-data retrieval
- price observations
- quote previews
- simulations
- proofs and attestations

These operations may carry `0` as a monetary amount or omit an amount entirely.

## Operations that require positive token value

A strictly positive amount is required for:

- PWRC transfers
- swap settlement
- protocol-fee settlement
- bridge settlement
- paid x402 settlement
- checkout settlement

This is the correct meaning of the project's "no zero transactions" rule:
**no zero-value settlement**, not "ban every zero-valued service operation."

## Signed messages

Signed messages are cryptographic operations, not token transfers. They can be
used for authentication, ownership proof, service authorization, quote
acceptance and challenge/response without moving PWRC or SOL.

## Market IDs

Market identifiers are independent of trade amount.

Examples:

```text
market:pyth:solana:PWRC/USD
market:birdeye:solana:PWRC/USD
```

Real DEX market/pool IDs must only be added after the pools exist on-chain.
Do not fabricate them in configuration.
