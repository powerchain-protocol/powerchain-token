# PowerChain (PWRC) 1.0.0

Production-oriented Solana Token-2022 deployment and verification package for PowerChain (PWRC).

## Canonical monetary policy

- Version: **1.0.0**
- Name: **PowerChain**
- Symbol: **PWRC**
- Chain: **Solana**
- Program: **Token-2022**
- Decimals: **9**
- Genesis/max supply: **18,446,000,000 PWRC**
- Raw genesis amount: **18,446,000,000,000,000,000**
- Future issuance after finalization: **0 PWRC**
- Freeze authority: **not enabled**
- Mint authority: **permanently disabled after verified genesis**
- Metadata: **Token-2022 MetadataPointer + TokenMetadata**

PWRC amounts are handled with integer/base-unit semantics only. The raw genesis amount is below the Solana token `u64` amount ceiling and is guarded by tests.

## Validate the repository

```bash
pnpm install --frozen-lockfile
pnpm ci
pnpm pwrc:doctor
pnpm pwrc:toolchain
```

`pwrc:toolchain` intentionally fails when the deployment workstation differs from the qualified toolchain in `config/toolchain.json`. A toolchain upgrade requires requalification on devnet.

## Devnet

```bash
export PWRC_METADATA_URI="https://token.powerchain.energy/metadata/metadata.json"

pnpm pwrc:devnet:prepare
pnpm pwrc:devnet:deploy
pnpm pwrc:devnet:verify

export PWRC_FINALIZATION_ENABLED=true
pnpm pwrc:devnet:finalize

PWRC_CLUSTER=devnet pnpm pwrc:release
```

## Mainnet mint precommitment

Create the mint keypair outside this repository:

```bash
solana-keygen new -o /secure/path/pwrc-mainnet-mint.json --no-bip39-passphrase
export PWRC_MINT_KEYPAIR=/secure/path/pwrc-mainnet-mint.json
export PWRC_EXPECTED_MINT="$(solana-keygen pubkey "$PWRC_MINT_KEYPAIR")"
```

Review the derived public mint address before any transaction is submitted.

## Mainnet genesis

```bash
export PWRC_MAINNET_ENABLED=true
export PWRC_METADATA_URI="https://token.powerchain.energy/metadata/metadata.json"

pnpm pwrc:mainnet:prepare
pnpm pwrc:mainnet:deploy
pnpm pwrc:mainnet:verify
```

## Mainnet finalization

Only after independent review:

```bash
export PWRC_FINALIZATION_ENABLED=true
export PWRC_FINALIZATION_CONFIRMATION="PWRC-1.0.0-IRREVERSIBLE"

pnpm pwrc:mainnet:finalize
PWRC_CLUSTER=mainnet-beta pnpm pwrc:release
```

Authority removal is irreversible.

## Evidence and recovery

Every deployment keeps:

- `inputs.lock.json` — SHA-256 commitment to token config, toolchain and metadata input.
- `journal.jsonl` — append-only hash-chained deployment journal.
- `evidence/*.json` — transaction confirmation and chain-state verification artifacts.
- `deployment.json` — current deployment state.
- `releases/1.0.0/*.release.json` — final release proof.

If deployment is interrupted, **do not delete the deployment directory and retry blindly**. Preserve the journal, inspect the chain state, and reconcile the partial deployment first.

See `docs/PRODUCTION.md`, `docs/SECURITY.md`, and `docs/MAINNET_CHECKLIST.md`.

## TypeScript / Anchor compatibility client

PWRC includes `client/client.ts` for existing Anchor/web3.js integrations and
read-only production verification. Run its tests with:

```bash
pnpm test:anchor
```

See `docs/CLIENT.md` for signer safety, RPC verification, Axios behavior, and
Anchor compatibility notes.

## Token logo and bridge metadata

The repository now includes local logo assets and JSON metadata templates for both:

- `metadata/metadata.json` — canonical **PWRC** token metadata
- `metadata/wpwrc.metadata.json` — bridged **wPWRC** wrapped-token metadata
- `metadata/assets/pwrc-logo.png` — PWRC token logo
- `metadata/assets/wpwrc-logo.png` — wrapped wPWRC token logo
- `config/bridge.json` — canonical/bridged asset relationship template

### Bridge intent

`wPWRC` is defined as the **wrapped bridged representation** of canonical PWRC.

Bridge policy template:

- canonical asset: **PWRC** on Solana
- wrapped asset: **wPWRC**
- backing: **1:1 backed by PWRC**
- wrapped supply must not exceed locked canonical PWRC
- metadata kept separate for canonical and wrapped assets

Validate token metadata with:

```bash
pnpm pwrc:metadata
```

## Canonical token domain

PWRC `1.0.0` uses **`https://token.powerchain.energy`** as the canonical public token domain.

Primary metadata:

```text
PWRC   https://token.powerchain.energy/metadata/metadata.json
wPWRC  https://token.powerchain.energy/metadata/wpwrc.metadata.json
```

GitHub is the secondary fallback. Set the exact GitHub Raw URLs in:

```bash
PWRC_GITHUB_METADATA_URI=
WPWRC_GITHUB_METADATA_URI=
```

The TypeScript client tries the canonical token domain first and only uses the configured GitHub URL when the primary metadata request fails.

## Official website and token domain

- Official PowerChain website: `https://powerchain.energy`
- PWRC token/metadata host: `https://token.powerchain.energy`

Token JSON metadata uses `https://powerchain.energy` as `external_url`, while metadata files and token-logo assets are served from `https://token.powerchain.energy`.

## Solana programs

PWRC includes `programs/pwrc-fees`, an Anchor `0.32.1` program for PowerChain-routed PWRC payments.

Protocol fee policy:

```text
250 basis points = 2.5%
PWRC decimals    = 9
```

The program's `transfer_with_fee` instruction transfers the net amount to the destination and the 2.5% fee to the configured PWRC fee vault. Arithmetic uses integer base units and a `u128` intermediate on-chain.

```bash
pnpm pwrc:fees
anchor build
cargo test -p pwrc-fees
```

See `docs/PROGRAMS.md`.

The Token-2022 `TransferFeeConfig` extension is documented in `config/fees.json` but remains **optional/not enabled**. The Anchor program therefore charges fees only on PowerChain-routed transactions and does not modify arbitrary wallet-to-wallet PWRC transfers.

## AI compute, x402, CCTP and ZK

PWRC `1.0.0` includes production policy modules for:

- secure AI-compute utility and bounded compute-job authorization;
- x402 v2 paid API / agent workflows on Solana;
- Circle CCTP v2 USDC cross-chain settlement;
- optional ZK/confidential-transfer experimentation.

Important separation of responsibilities:

```text
PWRC             → canonical Solana utility token
PWRC fee program → 250 bps PowerChain protocol transactions
x402             → HTTP paid API / agent payment protocol
CCTP v2          → native USDC cross-chain settlement
wPWRC bridge     → PWRC-specific wrapped-token bridge
ZK               → optional privacy layer; disabled on canonical PWRC mint
AI compute       → bounded jobs, budgets, tool allowlists and signed tickets
```

Run:

```bash
pnpm pwrc:integrations
```

See `docs/AI_SECURITY.md`, `docs/X402.md`, `docs/CCTP.md`, and `docs/ZK.md`.

## Tradeability, Pyth and Birdeye

PWRC is configured as a freely transferable Solana Token-2022 asset. Zero-value
transactions are rejected by application/bridge/payment policy, and 9 decimals
are enforced.

Market support includes:

- Pyth Hermes price-feed adapter with feed-ID and staleness validation
- Birdeye Solana price and V3 token market-data adapter
- Pyth-first / Birdeye-fallback market price helper
- bigint-only PWRC settlement amounts
- explicit DEX/liquidity/indexing readiness policy

Configure:

```bash
PWRC_PYTH_FEED_ID=
BIRDEYE_API_KEY=
PYTH_HERMES_URL=https://hermes.pyth.network
```

No PWRC Pyth feed ID or Birdeye market is fabricated before the real canonical
mint and market exist. See `docs/MARKET_DATA.md`.

## Production observability and readiness

The package now includes bounded read retries, provider-health scoring,
SHA-256 evidence envelopes, and explicit production-readiness reporting.

Run:

```bash
pnpm pwrc:readiness
```

This generates:

```text
reports/production-readiness.json
```

A missing canonical mint or missing HTTPS mainnet RPC is a hard production
blocker. Optional integrations such as Pyth, Birdeye, CCTP, and wPWRC are
reported independently rather than being treated as deployed/configured from
template files alone.

See `docs/OBSERVABILITY.md`.

## Operation-aware zero-value policy

The previous "no zero transactions" rule is now context-aware.

**Zero-value settlement is forbidden**, but zero-value/non-monetary operations
remain valid, including signed messages, authentication, service handshakes,
market discovery/data, quote previews, simulations, proofs, attestations and
health/status calls.

Market IDs and service IDs are amount-independent and deterministic. See
`docs/OPERATIONS.md`.

## Sui bridged PowerChain

The repository now contains a Sui Move package for **Wrapped PowerChain
(wPWRC)** under `programs/sui/wpwrc`.

PWRC remains canonical on Solana. wPWRC starts with zero supply on Sui and can
only be minted through the bridge controller after an authorized canonical
lock observation. Burns emit return-path events for canonical PWRC release.

```bash
pnpm pwrc:sui:bridge
pnpm wpwrc:build
pnpm wpwrc:testnet:deploy
```

Mainnet remains explicitly gated. See `docs/SUI_BRIDGE.md`.

### Sui bridge hardening

The wPWRC bridge now binds Solana lock claims to mint, vault, transaction,
instruction index, amount and Sui recipient; adds OTW registration tooling,
cross-chain supply evidence, deployment manifests, transport-agnostic Sui
deployment verification, and pause-only authority rotation.
