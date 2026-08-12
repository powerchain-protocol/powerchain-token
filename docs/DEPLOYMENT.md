# PWRC 1.0.0 Deployment

## Release model

PWRC is deployed devnet-first. Mainnet is disabled unless `PWRC_MAINNET_ENABLED=true`. Finalization is a separate irreversible operation.

## Devnet

```bash
pnpm install
pnpm ci
export PWRC_METADATA_URI="https://token.powerchain.energy/metadata/metadata.json"
pnpm pwrc:devnet:prepare
pnpm pwrc:devnet:deploy
pnpm pwrc:devnet:verify
export PWRC_EXPECTED_MINT="<DEVNET_MINT>"
export PWRC_FINALIZATION_ENABLED=true
pnpm pwrc:devnet:finalize
PWRC_CLUSTER=devnet pnpm pwrc:release
```

## Mainnet

Precommit the expected mint when your mint-generation/signing workflow supplies one. At minimum it **must** be set before verification/finalization.

```bash
export PWRC_MAINNET_ENABLED=true
export PWRC_EXPECTED_MINT="<MAINNET_MINT>"
export PWRC_METADATA_URI="https://token.powerchain.energy/metadata/metadata.json"
pnpm pwrc:mainnet:prepare
pnpm pwrc:mainnet:deploy
pnpm pwrc:mainnet:verify
```

After independent review:

```bash
export PWRC_FINALIZATION_ENABLED=true
export PWRC_FINALIZATION_CONFIRMATION="PWRC-1.0.0-IRREVERSIBLE"
pnpm pwrc:mainnet:finalize
PWRC_CLUSTER=mainnet-beta pnpm pwrc:release
```

Never mark mainnet `PUBLICLY_VERIFIED` merely because a transaction was submitted. Re-read the mint and independently verify the release artifact first.
