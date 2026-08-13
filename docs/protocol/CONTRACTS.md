# Contracts

## Solana

`programs/pwrc-lock` owns bridge configuration, vault custody boundaries, lock/release receipts, governance pause controls and fee-aware accounting. `programs/token` is a verification-only program for the canonical Token-2022 mint and exposes no public mint instruction. `programs/pwrc-fees` is deprecated/disabled because the canonical fee is native Token-2022 `TransferFeeConfig`.

## Sui

`contracts/wpwrc` owns the zero-genesis wPWRC TreasuryCap inside the shared bridge controller. The active Move source validates non-zero 32-byte message/destination values, protects mint/burn references from replay, checks supply ceilings, guards arithmetic counters and emits audit events for pause, burn policy and governance changes.

Mainnet package IDs remain unset until actual publish evidence is verified.

## Sui coin-registry metadata capability

The wPWRC initializer finalizes the Sui coin-registry currency builder, transfers
the resulting metadata capability to the publisher, and keeps the
`TreasuryCap<WPWRC>` inside the shared `BridgeController`. Metadata custody is
therefore separate from supply authority. Production deployment evidence should
record the resulting metadata-capability custody policy.
