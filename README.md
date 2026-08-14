# PowerChain Token

**Version:** `1.0.0`  
**Repository:** `powerchain-protocol/powerchain-token`

Complete source workspace for canonical PWRC on Solana Token-2022 and the Sui
wPWRC bridge representation.

## Canonical PWRC

```text
Name                     PowerChain
Symbol                   PWRC
Mint                     PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals                 9
Fixed supply             18,446,000,000 PWRC
Base units               18,446,000,000,000,000,000
Token standard           Token-2022
Native transfer fee      250 bps / 2.5%
Native fee cap           1,000,000 PWRC
```

Required Token-2022 extensions:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

## Fee architecture

PowerChain explicitly separates three fee classes:

1. **PWRC native Token-2022 fee** — 2.5%, capped at 1,000,000 PWRC.
2. **PowerChain service fee** — operation-level, default policy 2.5%, disabled
   until a reviewed recipient is configured.
3. **Network fee** — Solana/Sui network cost, displayed separately.

The application service fee is not another token-level fee. Ordinary
wallet-to-wallet PWRC transfers never receive the PowerChain service fee.

For bridge operations paid in PWRC, the service-fee transfer is separate from
principal and is grossed up for PWRC's native Token-2022 transfer fee so bridge
backing remains correct.

## wPWRC

```text
Name             Wrapped PowerChain
Symbol           wPWRC
Chain            Sui
Decimals         9
Genesis supply   0
Base-unit ratio  1:1
```

## Repository

```text
apps/
├── api/
├── client/
└── docs/

packages/
├── protocol/
├── sdk/
├── runtime/
├── native-token-client/
└── bridge-integration/

programs/
├── pwrc-lock/
└── token/

contracts/
└── wpwrc/

config/
env/
scripts/
tests/
docs/
```

## Start

```bash
corepack enable
corepack prepare pnpm@10.21.0 --activate
pnpm install

pnpm typecheck
pnpm test
pnpm production:check

pnpm start
```

Preferred endpoints:

```text
API      127.0.0.1:8787
Client   127.0.0.1:3000
Docs     127.0.0.1:3002
```

Normal full-stack startup chooses free loopback ports when those ports are
occupied. `pnpm start:strict` requires the exact ports.

## Service fee activation

Keep disabled until the reviewed fee wallet exists:

```env
PWRC_SERVICE_FEE_ENABLED=false
PWRC_SERVICE_FEE_BPS=250
PWRC_SERVICE_FEE_RECIPIENT=
```

The transaction review must display principal recipient, service-fee recipient,
principal native fee, service fee, native fee on service settlement, total PWRC
debit, and network fee before signing.

## Mainnet

```bash
pnpm mainnet:launch:plan
pnpm mainnet:status
```

The repository intentionally reports `readyForMainnet=false` until actual
lockfiles, binaries, deployment evidence and release authorization exist.
Missing on-chain facts are never fabricated.
## Network and RPC hardening

The full token repository now has explicit Localnet, Devnet and Mainnet
configuration in `config/networks.json`, plus environment-specific bridge
configuration under:

```text
config/devnet/bridge.json
config/mainnet/bridge.json
```

Useful commands:

```bash
pnpm network:status
pnpm rpc:check:solana:devnet
pnpm rpc:check:sui:devnet
pnpm devnet:preflight
pnpm mainnet:preflight
```

Production Mainnet requires dedicated RPC configuration and independent
secondary-RPC verification. It does not inherit the Localnet `pwrc_lock`
identity.

## Solana program deployment

PWRC verifier source identity:

```text
PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

The verifier now checks the canonical mint address, Token-2022 ownership,
9 decimals, fixed supply, revoked mint authority and disabled freeze authority.

Devnet and Mainnet deployment scripts verify that program keypair files resolve
to the expected public program IDs before calling `solana program deploy`.

Mainnet candidate builds:

```bash
pnpm mainnet:build:verifiable
```

## Sui integration

The Sui package now includes a shared `BridgeController` with governor/operator
separation, paused-by-default initialization, replay-protected Solana mint
messages, current wrapped-supply accounting, bridge mint/burn events and
TreasuryCap custody.

Publish scripts preserve the raw JSON output and generate an evidence record.
The configured `powerchain` alias address is never substituted for a real
published package ID.

## Documentation

See:

- `docs/NETWORKS.md`
- `docs/RPC.md`
- `docs/INTEGRATIONS.md`
- `docs/DEVNET.md`
- `docs/MAINNET.md`
- `programs/README.md`
- `contracts/README.md`
## Additional hardening

The repository now includes canonical drift checks across token, fee, bridge,
program and network configuration:

```bash
pnpm canonical:check
```

Bridge operations can be represented by deterministic operation traces with
direction, source transaction, source position, amount and destination bound
into a SHA-256 fingerprint. Ambiguous monetary submissions are only retryable
after reconciliation proves that neither source nor destination action was
observed.

Devnet qualification status:

```bash
pnpm devnet:status
```

A Mainnet candidate build manifest can be generated only after the real lock
files and binaries exist:

```bash
pnpm mainnet:build-manifest
```

See `docs/OPERATIONS.md` and `docs/SECURITY.md`.
## Quote/API integrity

The fee quote API now uses strict integer-base-unit parsing, a bounded operation
allowlist, bounded rate limiting, quote expiry, and a deterministic SHA-256
`quoteFingerprint`.

```text
issuedAt
expiresAt
quoteFingerprint
```

The fingerprint binds the fee-bearing operation and all monetary quote fields
before a request ID is added. A production transaction builder can therefore
reject stale or modified quotes before signing.

Useful checks:

```bash
pnpm api:check
pnpm release:bindings:check
pnpm devnet:verify:evidence
```

## Stronger release bindings

Mainnet evidence no longer passes merely because SHA-256-looking strings are
present. The verifier compares evidence hashes to the actual `pnpm-lock.yaml`,
`Cargo.lock`, `Move.lock`, compiled Solana binaries and Mainnet build manifest.

Release authorization is also bound to the exact evidence file and build
manifest by SHA-256.
## Release authorization consumption

The Mainnet release state machine now has a final explicit consumption step:

```text
SOURCE_READY
→ BUILD_READY
→ EVIDENCE_READY
→ AUTHORIZED
→ CONSUMED
```

`readyForMainnet` requires the `CONSUMED` state.

The authorization file is not mutated when consumed. Instead, PowerChain writes
a separate one-time receipt that binds:

```text
authorization SHA-256
evidence SHA-256
build-manifest SHA-256
consumedAt
consumedBy
```

Use:

```bash
pnpm mainnet:verify:build-manifest
pnpm mainnet:verify:evidence
pnpm mainnet:verify:authorization

PWRC_RELEASE_CONSUMPTION_CONFIRMATION=PWRC-1.0.0-CONSUME-AUTHORIZATION \
PWRC_RELEASE_CONSUMED_BY=<governance-identity> \
pnpm mainnet:consume:authorization

pnpm mainnet:verify:consumption
pnpm mainnet:status
```

Consumption is create-once (`wx`) and therefore fails if a receipt already
exists.

## Sui verification

The Sui deployment verifier now validates that the configured bridge-controller
object has the exact published type:

```text
<packageId>::wpwrc::BridgeController
```

When a secondary RPC is configured, package and controller object digests are
compared across both RPCs before the verification record is accepted.
## Coinbase CDP Solana SQL data

PowerChain includes an optional server-side Coinbase Developer Platform SQL API
integration for indexed PWRC activity on Solana Mainnet.

```text
GET /api/v1/data/solana/pwrc/transfers
GET /api/v1/data/solana/pwrc/volume
GET /api/v1/data/solana/pwrc/instructions
GET /api/v1/data/solana/pwrc/transfer-context
GET /api/v1/data/solana/wallet/transfers
```

The browser never receives the CDP Bearer credential. Clients can only select
validated parameters such as wallet, time window and result limit; arbitrary SQL
is not accepted.

Configuration:

```env
CDP_SQL_API_BEARER_TOKEN=
CDP_SQL_API_URL=https://api.cdp.coinbase.com/platform/v2/data/query/run
CDP_SQL_API_TIMEOUT_MS=10000
CDP_SQL_API_CACHE_MAX_AGE_MS=15000
```

This indexed-data integration is analytics/read infrastructure, not an
authority for bridge settlement or Mainnet release evidence.

See [`docs/CDP_SOLANA_SQL.md`](docs/CDP_SOLANA_SQL.md).
## API / Swagger

PowerChain Token now publishes an OpenAPI `3.1.0` contract for API v1.

```text
/api/v1                    route discovery
/api/v1/openapi.json       OpenAPI JSON
/api/v1/openapi.yaml       OpenAPI YAML
/swagger                   endpoint explorer
/swagger/openapi.yaml      canonical Swagger/OpenAPI YAML
/swagger.yaml              conventional root Swagger alias
```

Production checks compare the runtime route registry against OpenAPI to prevent
endpoint/spec drift.

See `docs/API.md`.
