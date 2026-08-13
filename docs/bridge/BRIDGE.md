# PWRC / wPWRC Bridge

PWRC `1.0.0` defines a canonical/wrapped bridge policy without claiming a live bridge deployment.

## Asset model

- **Canonical:** PWRC on Solana Token-2022
- **Wrapped:** wPWRC on Sui
- **Decimals:** 9 on both sides
- **Backing:** 1:1
- **Wrapped genesis supply:** 0
- **Canonical max:** 18,446,000,000 PWRC

## Conservation invariant

At all times, outstanding wrapped exposure must not exceed canonical PWRC locked for bridging.

The verifier includes pending bridge operations:

```text
effective wrapped exposure
=
wrapped supply
+ pending Solana -> Sui
+ pending Sui -> Solana

effective wrapped exposure <= locked canonical PWRC
```

Before canonical PWRC is released on the return path, the corresponding wPWRC must be burned or otherwise cryptographically proven consumed by the bridge protocol.

## Configuration

- `config/bridge.json` — canonical policy
- `config/bridge.devnet.json` — Solana devnet / Sui testnet deployment identity
- `config/bridge.mainnet.json` — Solana mainnet-beta / Sui mainnet identity

Fields are intentionally `null` until real on-chain IDs exist.

## Metadata

- `metadata/metadata.json` — PWRC
- `metadata/wpwrc.metadata.json` — wPWRC
- `metadata/manifest.sha256.json` — SHA-256 commitments to metadata and token logos

## Verification

```bash
pnpm pwrc:bridge
pnpm test
```

A live bridge integration must additionally verify source finality, destination finality, replay protection, lock/mint and burn/release correlation, and real on-chain locked/wrapped supply.

## Metadata URL policy

Canonical token domain:

- `https://token.powerchain.energy`

Primary metadata:

- PWRC: `https://token.powerchain.energy/metadata/metadata.json`
- wPWRC: `https://token.powerchain.energy/metadata/wpwrc.metadata.json`

Primary logos:

- PWRC: `https://token.powerchain.energy/assets/tokens/pwrc-logo.png`
- wPWRC: `https://token.powerchain.energy/assets/tokens/wpwrc-logo.png`

GitHub Raw is the secondary metadata source. Configure the exact reviewed repository URLs with:

```bash
export PWRC_GITHUB_METADATA_URI="https://raw.githubusercontent.com/<org>/<repo>/<ref>/metadata/metadata.json"
export WPWRC_GITHUB_METADATA_URI="https://raw.githubusercontent.com/<org>/<repo>/<ref>/metadata/wpwrc.metadata.json"
```

For production, pin the GitHub fallback to a reviewed commit SHA or immutable release ref rather than an unreviewed moving branch.
