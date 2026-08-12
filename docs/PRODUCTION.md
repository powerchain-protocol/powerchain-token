# PWRC 1.0.0 Production Operations

## Toolchain

The qualified release profile is recorded in `config/toolchain.json`:

- Agave / Solana CLI: 4.2.0
- SPL Token CLI: 5.6.1
- Node.js major: 24
- pnpm: 11.20.0

Run `pnpm pwrc:toolchain` on the deployment workstation. If a later toolchain is intentionally adopted, re-run the full devnet qualification before mainnet.

## Mainnet mint precommitment

Generate the mint keypair outside the repository on the approved signing workstation:

```bash
solana-keygen new -o /secure/path/pwrc-mainnet-mint.json --no-bip39-passphrase
export PWRC_MINT_KEYPAIR=/secure/path/pwrc-mainnet-mint.json
export PWRC_EXPECTED_MINT="$(solana-keygen pubkey "$PWRC_MINT_KEYPAIR")"
```

Never commit the keypair. Record only the public mint address in reviewed release materials.

## Failure handling

Deployment is intentionally non-atomic because mint creation, metadata initialization, token-account creation and genesis minting are separate transactions. `deployments/<cluster>/journal.jsonl` records each completed stage as a SHA-256 hash chain.

If a command stops part-way through, do not delete the journal or reuse the directory. Inspect on-chain state and the journal. Start a fresh deployment identity if the failed run cannot be safely reconciled.

## Finalization

Mint-authority removal is irreversible. On mainnet the finalizer requires:

- `PWRC_MAINNET_ENABLED=true`
- `PWRC_EXPECTED_MINT=<reviewed mint>`
- `PWRC_MINT_KEYPAIR=<matching secure keypair>`
- deployment state `GENESIS_VERIFIED`
- finalized evidence for all genesis transactions
- valid deployment journal
- exact 18,446,000,000 PWRC genesis supply
- 9 decimals
- Token-2022 program ownership
- no freeze authority
- `PWRC_FINALIZATION_ENABLED=true`
- `PWRC_FINALIZATION_CONFIRMATION=PWRC-1.0.0-IRREVERSIBLE`

The finalizer verifies the revocation transaction and then re-reads the mint state before setting deployment status to `FINALIZED`.
