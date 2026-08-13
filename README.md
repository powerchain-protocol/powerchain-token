# PowerChain

**Version:** `1.0.0`  
**Canonical token:** `PWRC`  
**Canonical network:** Solana mainnet-beta  
**Wrapped representation:** `wPWRC` on Sui  
**Repository:** PowerChain token, bridge, API, web, docs, protocol packages and release tooling

PowerChain is a security-first cross-chain token infrastructure monorepo. It
contains the canonical PWRC Token-2022 policy, the Sui wPWRC bridge model,
client SDKs, server-owned execution services, technical documentation, release
evidence tooling and production validation.

The repository distinguishes source readiness from build, deployment-evidence
and Mainnet authorization readiness. A passing source check is not proof of an
on-chain deployment.

## Monorepo layout

```text
.
├── apps/
│   ├── api/                  # HTTP API, quotes, readiness and execution gate
│   ├── docs/                 # Technical documentation application
│   └── web/                  # Browser application and same-origin API proxy
│
├── packages/
│   ├── protocol/             # Canonical PWRC/wPWRC protocol and policy logic
│   ├── sdk/                  # High-level PowerChain client SDK
│   ├── runtime/              # Shared Node.js runtime utilities
│   ├── native-token-client/  # Focused native token client
│   ├── bridge-integration/   # Bridge integration package
│   ├── docs-ui/              # Reusable docs rendering components
│   └── docs-content/         # Structured documentation sessions
│
├── programs/                 # Solana Anchor programs
├── contracts/                # Sui Move package
├── config/                   # Token, bridge, app and release policy
├── metadata/                 # PWRC and wPWRC metadata + manifests
├── openapi/                  # PowerChain API schema
├── idl/                      # Interface baselines and generated-artifact gates
├── scripts/                  # Build, verification, release and operations tooling
├── tests/                    # Repository-level protocol/security tests
├── docs/                     # Maintainer and operator documentation
└── reports/                  # Generated local validation reports
```

Reusable application/library code belongs in `packages/*`; runnable services
belong in `apps/*`. Repository-root TypeScript source directories are no longer
used as library ownership boundaries.

## GitHub repository

Recommended repository name: **`powerchain-token`**.

Use `powerchain-ai/powerchain-token` only if `powerchain-ai` is the actual
controlling GitHub organization. See
[GitHub Repository Naming](docs/reference/GITHUB_REPOSITORY.md).

## Workspace applications

| Package | Purpose | Default local endpoint |
|---|---|---|
| `@powerchain/api` | API, readiness, bridge quote/execution gate | `127.0.0.1:8787` |
| `@powerchain/client` | Browser UI and same-origin proxy | `127.0.0.1:3000` |
| `@powerchain/docs` | Technical documentation | `127.0.0.1:3002` |

## Workspace packages

| Package | Responsibility |
|---|---|
| `@powerchain/protocol` | Canonical token, bridge, burn, security and policy logic |
| `@powerchain/sdk` | High-level Solana/Sui/bridge client interfaces |
| `@powerchain/runtime` | Shared deterministic Node runtime utilities |
| `@powerchain/native-token-client` | Focused PWRC native token client |
| `@powerchain/bridge-integration` | Bridge finality, reconciliation and integration |
| `@powerchain/docs-ui` | Reusable documentation renderer |
| `@powerchain/docs-content` | Structured docs sessions/content |

## Canonical PWRC profile

```text
Network:             Solana mainnet-beta
Token standard:      Token-2022
Mint:                PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals:            9
Genesis/max supply:  18,446,000,000 PWRC
Transfer fee:        250 bps (2.5%)
Maximum fee:         1,000,000 PWRC
Freeze authority:    null
Wrapped asset:       wPWRC on Sui
Wrapped genesis:     0
Bridge ratio:        1:1 base-unit domain
```

Required Token-2022 extensions:

- `TransferFeeConfig`
- `MetadataPointer`
- `TokenMetadata`

The source repository does not assume deployment authority state. Mint,
transfer-fee and bridge authority facts must come from verified deployment or
on-chain evidence.

## Requirements

Local compatibility baseline:

```text
Node.js  22.22.3
pnpm     10.21.0
```

Activate the repository runtime:

```bash
source scripts/bootstrap/activate-node.sh
```

Install:

```bash
pnpm install
```

## Development

Start the API and web stack on strict default ports:

```bash
pnpm start
```

Use automatically allocated local ports when defaults are occupied:

```bash
pnpm start:auto
```

Start documentation:

```bash
pnpm start:docs
```

Run an individual app:

```bash
pnpm --filter @powerchain/api start
pnpm --filter @powerchain/client start
pnpm --filter @powerchain/docs start
```

## Validation

Core repository gates:

```bash
pnpm pnpm:check
pnpm monorepo:check
pnpm production:check
pnpm typecheck
pnpm test
pnpm fullstack:ports-test
pnpm fullstack:runtime-test
pnpm fullstack:test
pnpm docs:app:test
```

Production validation is intentionally fail-closed. It validates source policy
and runtime safety without converting missing build/deployment artifacts into
fake evidence.

## Documentation

Start with [`docs/README.md`](docs/README.md).

Core guides:

- [Getting started](docs/GETTING_STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Full-stack runtime](docs/FULLSTACK.md)
- [Configuration](docs/CONFIGURATION.md)
- [API](docs/API.md)
- [Bridge model](docs/BRIDGE_MODEL.md)
- [Security](docs/SECURITY.md)
- [Development](docs/DEVELOPMENT.md)
- [Testing](docs/TESTING.md)
- [Operations runbook](docs/OPERATIONS_RUNBOOK.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Mainnet](docs/MAINNET.md)
- [Release](docs/RELEASE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

Specialized documentation is grouped under `docs/protocol`, `docs/bridge`,
`docs/security`, `docs/development`, `docs/integrations`, `docs/reference`,
`docs/release` and `docs/apps`.

## Mainnet readiness

The release state is sequential:

```text
SOURCE_READY
  ↓
BUILD_READY
  ↓
EVIDENCE_READY
  ↓
AUTHORIZED
  ↓
CONSUMED
```

Missing generated IDLs, compiled programs, Move lockfiles, deployment evidence
or release authorization remain explicit blockers. They are never fabricated
by source tooling.

Check current state with:

```bash
pnpm pwrc:mainnet:status
```

## Security boundaries

PowerChain uses the following default security model:

- integer/base-unit token accounting
- native Token-2022 transfer-fee semantics
- explicit Solana and Sui address validation
- bounded RPC retry for reads
- no blind transaction-write retries
- durable execution idempotency
- quote fingerprint verification
- server-only execution credentials
- Mainnet execution gated by fresh readiness state
- deterministic serialization and hashing
- release provenance and evidence binding
- fail-closed bridge conservation checks

See [Security](docs/SECURITY.md) and
[Security model](docs/security/SECURITY_MODEL.md).

## Official resources

- Website: `https://powerchain.energy`
- App: `https://app.powerchain.energy`
- Bridge: `https://bridge.powerchain.energy`
- Documentation: `https://docs.powerchain.energy`
- Whitepaper: `https://whitepaper.powerchain.energy`
- X: `https://x.com/powerchain_ai`
- Telegram: `https://t.me/powerchain_official`

## Version policy

This repository is pinned to **PowerChain `1.0.0`**. Workspace packages,
applications, contracts, programs, documentation and release metadata must not
silently drift to another version.
