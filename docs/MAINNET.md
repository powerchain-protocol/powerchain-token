# Mainnet Release

**Version:** `1.0.0`

Mainnet is fail-closed.

## 1. Reproducibility

Required:

```text
pnpm-lock.yaml
Cargo.lock
contracts/wpwrc/Move.lock
```

## 2. Verifiable Solana build

```bash
pnpm mainnet:build:verifiable
cargo test --workspace
```

Anchor verifiable builds require the containerized build environment and bind
the deployed program to reproducible build output.

## 3. Preflight

```bash
pnpm mainnet:preflight
```

This requires the final program IDs, program keypair paths, deployer keypair,
Mainnet RPC and built binaries.

## 4. Solana deploy

```bash
PWRC_MAINNET_DEPLOY_ENABLED=true \
PWRC_MAINNET_DEPLOY_CONFIRMATION=PWRC-1.0.0-DEPLOY-SOLANA \
PWRC_MAINNET_RPC_URL=https://... \
PWRC_MAINNET_DEPLOYER_KEYPAIR=/secure/deployer.json \
PWRC_TOKEN_PROGRAM_ID_MAINNET=PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu \
PWRC_TOKEN_PROGRAM_KEYPAIR=/secure/pwrc-token.json \
PWRC_LOCK_PROGRAM_ID_MAINNET=<final-lock-program-id> \
PWRC_LOCK_PROGRAM_KEYPAIR=/secure/pwrc-lock.json \
pnpm mainnet:deploy:solana
```

## 5. Solana verify

```bash
PWRC_MAINNET_RPC_URL=https://primary... \
PWRC_RPC_URL_SECONDARY=https://secondary... \
PWRC_TOKEN_PROGRAM_ID_MAINNET=PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu \
PWRC_LOCK_PROGRAM_ID_MAINNET=<final-lock-program-id> \
pnpm mainnet:verify:solana
```

## 6. Sui publish

```bash
WPWRC_MAINNET_ENABLED=true \
WPWRC_MAINNET_CONFIRMATION=WPWRC-1.0.0-MAINNET \
SUI_MAINNET_RPC_URL=https://... \
pnpm sui:publish:mainnet
```

Do not manually invent package/object IDs after publish. Parse them from the
publish response and verify them from independent RPC observations.

## 7. Evidence

Create `config/mainnet/evidence.json` from actual observations and then run:

```bash
pnpm mainnet:verify:evidence
```

The verifier requires both Solana programs to be executable and independently
observed, the token verifier to match the configured source identity, real
deployment transaction/slot evidence, Sui publish/checkpoint evidence, and
release hashes.

## 8. Authorization

The release authorization must be time-bounded, unused, bound to evidence/build
hashes and contain governance signature evidence.

```bash
pnpm mainnet:verify:authorization
pnpm mainnet:status
```

Only `readyForMainnet: true` is a release-ready state.


## 9. Consume authorization

After build manifest, deployment evidence and release authorization all verify,
consume the authorization exactly once:

```bash
PWRC_RELEASE_CONSUMPTION_CONFIRMATION=PWRC-1.0.0-CONSUME-AUTHORIZATION PWRC_RELEASE_CONSUMED_BY=<governance-identity> pnpm mainnet:consume:authorization
```

The resulting `config/mainnet/release-consumption.json` binds the exact
authorization, evidence and build-manifest files by SHA-256.

Verify it:

```bash
pnpm mainnet:verify:consumption
pnpm mainnet:status
```

`readyForMainnet` requires:

```text
buildManifestVerified  true
deploymentEvidenceReady true
releaseAuthorized      true
authorizationConsumed  true
releaseState           CONSUMED
```
