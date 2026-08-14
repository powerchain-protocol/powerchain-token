# PWRC Lock Program

**Version:** `1.0.0`

The bridge-lock program is the Solana-side state/authority boundary.

The current source starts bridge state paused and separates governor-controlled
pause state. The final Mainnet program ID is not populated until a reviewed
program keypair, qualified build, deployment and independent RPC evidence
exist.

## Build

```bash
anchor build --program-name pwrc_lock
cargo test -p pwrc-lock
```

## Deployment

Devnet:

```bash
PWRC_DEVNET_DEPLOY_ENABLED=true \
PWRC_LOCK_PROGRAM_ID_DEVNET=<reviewed-program-id> \
PWRC_LOCK_PROGRAM_KEYPAIR=/secure/path/pwrc-lock.json \
PWRC_TOKEN_PROGRAM_KEYPAIR=/secure/path/pwrc-token.json \
PWRC_DEVNET_DEPLOYER_KEYPAIR=/secure/path/deployer.json \
pnpm devnet:deploy:solana
```

Mainnet is separately gated and requires an explicit confirmation string.
