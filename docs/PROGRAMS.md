# PWRC Solana Programs

## `programs/pwrc-fees`

Anchor `0.32.1` program for PowerChain-routed PWRC transactions.

### Fee policy

- PWRC decimals: **9**
- Protocol fee: **250 basis points**
- 250 bps = **2.5%**
- Fee calculation uses `u128` intermediates on-chain to avoid `u64` multiplication overflow.
- The program routes the net PWRC amount to the requested destination and the fee amount to the configured PWRC fee vault.
- The program validates that source, destination, and fee vault all use the configured PWRC mint.

### Important distinction

This program collects fees only for transfers routed through `transfer_with_fee`.
It does **not** tax arbitrary wallet-to-wallet PWRC transfers.

If all Token-2022 transfers must incur a 2.5% fee, the PWRC mint must be created with the Token-2022 `TransferFeeConfig` extension **before mint initialization**. That extension has its own transfer-fee authority and withdraw-withheld authority and therefore changes the canonical mint authority surface.

The current production token configuration keeps that Token-2022 extension optional/not enabled until explicitly approved.

### Build and test

```bash
anchor build
cargo test -p pwrc-fees
pnpm test
```

### Deployment

The program ID in `Anchor.toml` / `declare_id!` is a development placeholder. Before devnet deployment, generate and review the actual program keypair and run Anchor's key synchronization workflow so the program ID matches the deploy key.

Do not mark the program production verified until a reproducible/verified build has been compared against the deployed bytecode.

## Canonical fee collector

PWRC protocol fees are assigned to this canonical Solana owner:

```text
FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy
```

This is the **fee collector owner/authority**, not the PWRC token account itself.

Because protocol fees are collected in PWRC, the actual destination is the
Token-2022 associated token account derived from the canonical PWRC mint and
the fee collector:

```text
fee vault =
ATA(
  PWRC_MINT,
  FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy,
  TOKEN_2022_PROGRAM_ID
)
```

`derivePwrcFeeVault(mint)` performs this derivation in the TypeScript client.

The fee program rejects fee vaults that are not owned by the canonical fee
collector. The client also rejects an explicitly supplied fee vault if it does
not match the deterministic Token-2022 ATA.

Fee policy is fixed for PWRC `1.0.0`:

- `250` basis points
- `2.5%`
- `9` decimals
- integer/base-unit fee arithmetic
- floor rounding
- receipt-PDA idempotency

## Production hardening

PWRC `1.0.0` treats the configured fee destination as immutable after program
initialization. `set_fee_vault` is intentionally not exposed.

Transaction submission follows this sequence:

1. derive and verify the canonical Token-2022 fee-vault ATA;
2. verify source, destination, mint and source balance;
3. check the receipt PDA for an already-processed logical payment;
4. construct and sign one transaction;
5. simulate the exact signed bytes;
6. submit those exact bytes;
7. confirm with the same blockhash and last-valid-block-height;
8. retrieve finalized transaction evidence;
9. verify the receipt PDA exists.

If the receipt already exists, the client returns `alreadyProcessed: true`
instead of charging the logical payment again.

The program rejects:

- non-Token-2022 transfers;
- source and destination being the same account;
- gross amounts above the canonical PWRC maximum;
- insufficient source balance;
- a fee vault not owned by the canonical fee collector;
- a source account not owned by the signer;
- transfers while the fee router is paused.
