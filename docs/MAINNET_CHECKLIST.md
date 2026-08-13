# PowerChain `1.0.0` Mainnet Checklist

## Repository and toolchain

- [ ] `pnpm-lock.yaml` is committed and `pnpm install --frozen-lockfile` succeeds.
- [ ] `pnpm production:check`, `pnpm typecheck`, and `pnpm test` pass.
- [ ] Anchor builds `pwrc_lock` and `pwrc_token` successfully.
- [ ] Sui Move edition 2024 build and tests pass; generated `Move.lock`, its SHA-256, and Sui CLI version are archived.
- [ ] Generated Anchor IDLs and normalized Sui modules pass IDL verification.
- [ ] Release provenance and ABI fingerprints are regenerated from final sources.

## Solana canonical mint

- [ ] Mint equals `PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc`.
- [ ] Owner is Token-2022.
- [ ] Decimals equal 9.
- [ ] Supply does not exceed `18,446,000,000,000,000,000` base units.
- [ ] Finalized fixed-supply state has null mint authority.
- [ ] Freeze authority is null.
- [ ] Required extensions are exactly `TransferFeeConfig`, `MetadataPointer`, `TokenMetadata`.
- [ ] Transfer fee is exactly 250 bps.
- [ ] Maximum fee is exactly 1,000,000 PWRC.
- [ ] Transfer-fee config authority is recorded and reviewed.
- [ ] Withdraw-withheld authority is recorded and reviewed.

## Solana bridge

- [ ] `pwrc_lock` Mainnet program ID is an executable verified deployment.
- [ ] Bridge vault mint/owner and PDA derivation are verified.
- [ ] Operator and governor are separate reviewed custody identities.
- [ ] Bridge is paused during governance changes and canonical quarterly-burn reconciliation.
- [ ] Lock/release replay receipts are tested on Mainnet-compatible simulation.

## Sui wPWRC

- [ ] Published package ID comes from deployment evidence, not the `powerchain` alias.
- [ ] Coin type, currency object and shared bridge controller IDs are verified.
- [ ] wPWRC decimals equal 9 and genesis supply equals 0.
- [ ] TreasuryCap remains encapsulated by the controller.
- [ ] Minting is bridge-authority only.
- [ ] Message/burn reference replay protection is verified.
- [ ] Bridge/governor rotations and pause controls are tested.

## RPC and operations

- [ ] Dedicated HTTPS primary and secondary Solana RPC endpoints are configured.
- [ ] WSS endpoint is configured where subscriptions are used.
- [ ] Public Mainnet RPC fallback is disabled in production.
- [ ] Read retry/timeout policy is active.
- [ ] Blind write retries are disabled.
- [ ] Ambiguous writes are reconciled before any resubmission.
- [ ] Audit logs contain no secrets or key material.

## Final release

- [ ] `pnpm pwrc:mainnet:status` has no blockers.
- [ ] `pnpm pwrc:mainnet:preflight` passes.
- [ ] Deployment evidence, source hashes, ABI fingerprints and signer evidence are archived.
- [ ] No private key, seed phrase, API secret or keypair JSON exists in the repository.


## Signed deployment evidence

```bash
pnpm mainnet:evidence:prepare
# populate config/mainnet/evidence.json from real build/on-chain evidence
pnpm mainnet:evidence:verify
pnpm pwrc:mainnet:preflight
```

`readyForMainnet` must not be manually overridden.
