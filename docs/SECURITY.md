# PWRC Security

PWRC 1.0.0 is designed as a permission-minimized Token-2022 asset.

## Monetary invariants

- 9 decimals.
- Genesis/max supply: 18,446,000,000 PWRC.
- Raw genesis amount: 18,446,000,000,000,000,000.
- One genesis issuance flow.
- Freeze authority is not enabled.
- Mint authority is permanently disabled after genesis verification.

## Operational rules

- Devnet qualifies the exact release before mainnet.
- Mainnet execution is disabled by default.
- Finalization is disabled separately.
- Never commit signer keypairs or seed phrases.
- Re-read on-chain state after every irreversible transaction.
- Treat the mint address, not ticker/name, as canonical identity.
