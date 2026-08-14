# Devnet Qualification

Devnet is the required qualification stage before a Mainnet candidate.

## Solana

Build:

```bash
anchor build --program-name pwrc_token
anchor build --program-name pwrc_lock
cargo test --workspace
```

Deploy:

```bash
PWRC_DEVNET_DEPLOY_ENABLED=true \
PWRC_DEVNET_DEPLOYER_KEYPAIR=/secure/devnet-deployer.json \
PWRC_TOKEN_PROGRAM_KEYPAIR=/secure/pwrc-token.json \
PWRC_LOCK_PROGRAM_KEYPAIR=/secure/pwrc-lock.json \
PWRC_LOCK_PROGRAM_ID_DEVNET=<public-id> \
pnpm devnet:deploy:solana
```

Raw CLI output is saved under `deployments/devnet/solana/raw/`. It is not
automatically promoted to Mainnet evidence.

## Sui

```bash
WPWRC_DEVNET_PUBLISH_ENABLED=true \
pnpm sui:publish:devnet
```

The publish JSON is preserved and normalized into a Devnet evidence record.

Qualification must cover replay rejection, zero amount rejection, pause and
authority paths, exact 9-decimal accounting, bridge conservation and ambiguous
write reconciliation.
