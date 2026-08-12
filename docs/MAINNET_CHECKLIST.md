# PWRC 1.0.0 Mainnet Checklist

## Release qualification

- [ ] `pnpm install --frozen-lockfile` succeeds with the committed lockfile.
- [ ] `pnpm ci` passes.
- [ ] `pnpm pwrc:doctor` passes.
- [ ] `pnpm pwrc:toolchain` matches the qualified toolchain.
- [ ] Devnet deployment completed using the same source/config/metadata inputs.
- [ ] Devnet transaction confirmations are finalized.
- [ ] Devnet genesis verification passes.
- [ ] Devnet finalization proves additional minting authority is absent.
- [ ] Devnet journal hash chain verifies.

## Mainnet preparation

- [ ] Metadata JSON and image are production assets.
- [ ] Metadata URI is reviewed and stable/content-addressed where practical.
- [ ] Deployment fee-payer key is stored outside the repository.
- [ ] Mainnet mint keypair is generated and stored outside the repository.
- [ ] `PWRC_EXPECTED_MINT` equals `solana-keygen pubkey "$PWRC_MINT_KEYPAIR"`.
- [ ] Expected mint address is reviewed independently before deployment.
- [ ] RPC endpoint is approved.
- [ ] Sufficient SOL exists for mint, metadata and treasury account creation.
- [ ] `PWRC_MAINNET_ENABLED=true` is scoped only to the approved session.

## Genesis

- [ ] Token program owner is Token-2022.
- [ ] Mint address equals the precommitted expected mint.
- [ ] Decimals equal 9.
- [ ] Raw genesis supply equals `18446000000000000000`.
- [ ] UI genesis supply equals `18446000000`.
- [ ] Treasury token account is recorded.
- [ ] Metadata name is PowerChain.
- [ ] Metadata symbol is PWRC.
- [ ] Freeze authority is absent.
- [ ] Create-mint transaction is finalized.
- [ ] Metadata transaction is finalized.
- [ ] Treasury creation transaction is finalized.
- [ ] Genesis mint transaction is finalized.
- [ ] Deployment journal verifies.
- [ ] Deployment state is `GENESIS_VERIFIED`.

## Irreversible finalization

- [ ] Independent operator reviews mint, supply, treasury and evidence.
- [ ] `PWRC_FINALIZATION_ENABLED=true` set only for finalization.
- [ ] `PWRC_FINALIZATION_CONFIRMATION=PWRC-1.0.0-IRREVERSIBLE` set.
- [ ] Pre-finalization chain verification passes again immediately before submission.
- [ ] Mint authority revocation transaction reaches finalized commitment.
- [ ] Post-finalization mint state is independently re-read.
- [ ] Mint authority is absent.
- [ ] Freeze authority remains absent.
- [ ] Final journal hash chain verifies.
- [ ] `pnpm pwrc:release` generates release proof.
- [ ] Canonical registry is updated only after final verification.

Never commit a private key, seed phrase or keypair JSON file.
