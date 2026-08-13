# PowerChain (PWRC) — Token & Bridge Workspace

**Version:** `1.0.0`

Production-oriented source workspace for the canonical PowerChain token on Solana,
the Sui `wPWRC` bridge representation, client libraries, IDL contracts, release
evidence, and fail-closed Mainnet readiness checks.

## Canonical PWRC profile

| Field | Value |
|---|---|
| Name | PowerChain |
| Symbol | PWRC |
| Canonical chain | Solana `mainnet-beta` |
| Token standard | Token-2022 |
| Canonical mint | `PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc` |
| Decimals | `9` |
| Fixed supply | `18,446,000,000 PWRC` |
| Fixed supply base units | `18,446,000,000,000,000,000` |
| Native transfer fee | `250 bps` / `2.5%` |
| Maximum transfer fee | `1,000,000 PWRC` |
| Maximum fee base units | `1,000,000,000,000,000` |
| Mint authority | must be revoked after verified genesis |
| Freeze authority | must be `null` |

Required Token-2022 extensions:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

The canonical profile forbids unrelated extensions such as permanent delegate,
mint-close authority, default-frozen state, interest-bearing configuration,
scaled UI amount, pausable, and non-transferable behavior.

> The canonical mint address is configured in this repository, but Mainnet
> readiness still requires independent on-chain verification of mint state,
> supply, authorities, transfer-fee configuration, and authority custody.

## wPWRC on Sui

`wPWRC` is the 9-decimal Sui bridge representation of PWRC.

```text
Genesis supply:      0 wPWRC
Mint policy:         bridge-only
Decimal domain:      9 decimals
Base-unit factor:    1
Canonical backing:   net spendable PWRC bridge backing
```

The economic ratio is 1:1 in the common base-unit domain, but Solana transfers
are fee-bearing.

### Solana → Sui

```text
gross PWRC transfer
- Token-2022 transfer fee
= net spendable PWRC credited to bridge backing
= wPWRC minted
```

### Sui → Solana

```text
wPWRC burned
= gross PWRC released from bridge backing

gross release
- Token-2022 transfer fee
= net PWRC received by the Solana destination
```

Transfer-fee withheld amounts are not counted as spendable bridge backing.

## Metadata and token images

Repository assets:

```text
public/assets/pwrc.png
public/assets/wpwrc.png
```

When served from a web application's static `public/` root:

```text
/assets/pwrc.png
/assets/wpwrc.png
```

Canonical metadata endpoints:

```text
On-chain metadata URI: https://powerchain.energy/metadata/metaplex.json
Public metadata JSON:  https://token.powerchain.energy/metadata/metadata.json
PWRC public image:     https://token.powerchain.energy/assets/tokens/pwrc-logo.png
wPWRC metadata:        https://token.powerchain.energy/metadata/wpwrc.metadata.json
```

Official product links:

```text
Website:    https://powerchain.energy
Bridge:     https://bridge.powerchain.energy
App:        https://app.powerchain.energy
Docs:       https://docs.powerchain.energy
Whitepaper: https://whitepaper.powerchain.energy
X:          https://x.com/powerchain_ai
Telegram:   https://t.me/powerchain_official
```

## Repository layout

```text
programs/
├── pwrc-lock/                  Solana PWRC ↔ wPWRC bridge custody program
├── token/                      canonical PWRC Token-2022 verifier
└── pwrc-fees/                  deprecated custom fee-router source

contracts/
└── wpwrc/                      active Sui Move bridge package

packages/
├── native-token-client/        exact PWRC client/fee/bridge helpers
└── bridge-integration/         production integration/readiness helpers

idl/                            expected/generated ABI contracts + release gates
metadata/                       canonical PWRC/wPWRC metadata
public/assets/                  local PWRC/wPWRC PNG assets
config/                         token, bridge, fee, network, Mainnet policies
scripts/                        validation/build/deployment/release tooling
```

`programs/pwrc-fees` is deprecated. Canonical transfer fees are implemented by
Token-2022 `TransferFeeConfig`; there is no second custom protocol-router fee.

## Sui RPC environments

| Network | RPC endpoint | Production target |
|---|---|---:|
| testnet | `https://fullnode.testnet.sui.io:443` | |
| mainnet | `https://fullnode.mainnet.sui.io:443` | **✓** |
| devnet | `https://fullnode.devnet.sui.io:443` | |
| local | `http://127.0.0.1:9000` | |

Machine-readable configuration lives under `config/sui/`.

## Production checks

Run the static production suite:

```bash
pnpm production:check
```

Useful focused checks:

```bash
pnpm token:production:check
pnpm pwrc:fees
pnpm pwrc:metadata:validate
pnpm pwrc:metadata:assets-check
pnpm pwrc:bridge:upgrade-check
pnpm pwrc:client:check
pnpm pwrc:idl:check
pnpm pwrc:mainnet:status
```

When dependencies and toolchains are installed:

```bash
pnpm production:build:ts
pnpm production:build:solana
pnpm production:build:sui
```

A full Mainnet build is intentionally gated:

```bash
pnpm mainnet:build
```

## Solana programs

### `pwrc-lock`

Escrows canonical PWRC and releases custody only against authenticated,
replay-protected bridge evidence. Solana → Sui lock accounting records the net
spendable amount after the Token-2022 transfer fee.

### `pwrc-token`

Verification-only Anchor program for the canonical PWRC Token-2022 mint. It
exposes no public mint instruction and verifies the canonical mint address,
fixed supply, authority state, required extensions, and transfer-fee schedules.

Localnet program IDs are development identities only and are not Mainnet
deployment evidence.

## Sui capability model

`TreasuryCap<WPWRC>` is encapsulated by the shared bridge controller rather than
being handed to an unrestricted publisher/operator address. The bridge starts
paused, uses separate authority/governor roles, and permanently consumes replay
identifiers before bridge mint/release state transitions.

The configured `powerchain` Sui address is an alias/configuration value only.
It must not be treated as the published package ID without deployment evidence.

## Conservation and reconciliation

All bridge accounting uses the common 9-decimal base-unit domain.

For a reconciled state, `PWRC_backing` means **net spendable canonical PWRC
controlled by the bridge**, excluding Token-2022 withheld transfer fees.

```text
PWRC_backing
=
wPWRC_circulating
+ pending_Solana_to_Sui
+ pending_Sui_to_Solana
```

Pending semantics must be state-machine consistent:

- `pending_Solana_to_Sui`: net PWRC backing finalized on Solana but not yet
  represented by finalized wPWRC minting;
- `pending_Sui_to_Solana`: wPWRC already burned but corresponding gross PWRC
  release not yet finalized on Solana.

## IDL and ABI release policy

Expected source interfaces live under `/idl`; toolchain-generated artifacts are
accepted only after real Anchor/Sui builds.

```bash
pnpm idl:check-all
pnpm idl:build
pnpm idl:sync
pnpm idl:generated:verify
pnpm idl:release
pnpm idl:readiness
```

Release readiness requires generated IDLs for both `pwrc_lock` and `pwrc_token`,
plus normalized Sui module evidence. Expected-interface JSON never substitutes
for generated deployment artifacts.

## Mainnet readiness

```bash
pnpm pwrc:mainnet:status
pnpm pwrc:mainnet:preflight
```

Mainnet remains fail-closed until required evidence is verified, including:

- canonical mint account and exact Token-2022 state;
- fixed supply and authority revocation;
- transfer-fee schedules and transfer-fee authority custody;
- Solana bridge program and vault deployment;
- generated Anchor IDLs and discriminators;
- reviewed Sui Move 2024 build, `Move.lock` SHA-256, and Sui CLI version;
- Sui package, Currency/metadata/controller identities;
- normalized Sui module ABI;
- bridge/governance role separation;
- deployment transaction/checkpoint/slot/signature evidence;
- release provenance and ABI commitments.

No Mainnet program/package/object identity should be fabricated to satisfy a
readiness check.

## Provenance

```bash
pnpm pwrc:release:provenance
pnpm idl:attestation
pnpm idl:attestation:verify
```

Static checks, source hashes, ABI fingerprints, and unsigned attestations are
release evidence. They are not proof that a chain build or deployment occurred.

## Documentation

Start with:

```text
docs/README.md
docs/TOKEN_PROGRAM.md
docs/TOKEN_ASSETS.md
docs/WPWRC_SPECIFICATION.md
docs/BRIDGE_INTENT.md
docs/SECURITY_MODEL.md
docs/PRODUCTION_MAINNET.md
idl/README.md
```

## Runtime and transaction hardening

The `1.0.0` runtime now centralizes retry/timeout/URL/u64 utilities, SHA-256 replay/idempotency keys, fee-aware Token-2022 transactions, write reconciliation handlers, Devnet/Mainnet preflights and optional Next.js host security configuration.

```bash
pnpm production:check
pnpm pwrc:devnet:status
pnpm pwrc:mainnet:status
pnpm clean:cache
```

Mainnet remains fail-closed until deployment and authority evidence is verified.

## Node, pnpm and dependency build approvals

The workspace is pinned to:

```text
Node.js: 26.7.0 Current
pnpm:    10.21.0
```

Use the committed `.nvmrc` / `.node-version` and then activate pnpm:

```bash
npm install --global corepack@latest
corepack enable
corepack prepare pnpm@10.21.0 --activate

node --version
pnpm --version
pnpm install
```

pnpm dependency install scripts are **allowlisted**, not globally enabled.
The reviewed build-script dependencies are:

```text
bigint-buffer@1.1.5
bufferutil@4.1.0
esbuild@0.25.12
utf-8-validate@6.0.6
```

They are declared under `onlyBuiltDependencies` in `pnpm-workspace.yaml`, which
is the pnpm `10.21.0` build-approval mechanism. `strictDepBuilds: true` makes a
new unreviewed dependency build fail the install rather than silently ignoring
it.

Useful checks:

```bash
pnpm pnpm:check
pnpm pnpm:ignored-builds
pnpm telemetry:check
```

`pnpm approve-builds` remains available for reviewing future new build-script
dependencies. Do not enable `dangerouslyAllowAllBuilds`.

Build-tool telemetry is disabled with:

```text
NEXT_TELEMETRY_DISABLED=1
TURBO_TELEMETRY_DISABLED=1
DO_NOT_TRACK=1
```


## Root architecture

Shared utilities are organized by execution environment:

- `src/common/` — canonical TypeScript runtime implementations.
- `src/utils/` — public typed utility exports.
- `utils/` — dependency-free Node/release utilities.
- `scripts/` — orchestration only; shared primitives belong in `utils/`.

See `docs/ROOT-ARCHITECTURE.md`.

```bash
pnpm pwrc:root:check
pnpm pwrc:root:map
```


### Root platform checks

```bash
pnpm pwrc:root:platform-check
pnpm pwrc:config:registry-check
pnpm pwrc:utils:duplication-check
```

The release/build scripts use a shared dependency-free platform layer for
configuration, process execution, atomic writes, hashing, network validation,
structured logging, redaction, environment parsing and root constants.


## Security hardening

The `1.0.0` root platform fails closed around release tooling and untrusted
configuration.

Key controls:

- canonical JSON used by SHA-256/signature flows rejects `undefined`, `BigInt`,
  non-finite numbers, cycles, and non-plain objects instead of silently
  normalizing ambiguous values;
- structured logging redacts secret-like keys, bearer credentials, secret
  assignments, credential-bearing URLs, and cyclic structures;
- child processes use argument arrays with `shell: false`, bounded timeout, and
  bounded output buffers;
- production JSON configuration reads are contained to the repository root and
  reject direct symlink config files;
- atomic state/report writes use exclusive randomized temporary files, `fsync`,
  and same-directory rename;
- Mainnet preflight uses the shared safe process runner and requires the exact
  `AUTHORIZED` state with an unused authorization before creating a short-lived
  preflight proof.

Run:

```bash
pnpm pwrc:security:hardening-check
pnpm test:root-security
pnpm production:check
```

Passing static checks does not mean Mainnet deployment has occurred. Real
build artifacts, on-chain evidence, dual-RPC observations, signed evidence,
and a fresh one-time release authorization are still required.


## Full-stack applications

The workspace now includes wired application surfaces:

```text
apps/
├── api/    Node API and server-only bridge executor adapter
└── web/    responsive status/quote frontend with same-origin API proxy
```

Start them in separate terminals:

```bash
pnpm app:api
pnpm app:web
```

Then open:

```text
http://127.0.0.1:3000
```

The web UI reads canonical token data, Mainnet readiness, bridge capability and
server-generated fee-aware quotes from the API. Browser code does not receive
bridge executor credentials.

Bridge execution remains fail-closed until the existing build/evidence/release
gates are all satisfied and the separate server execution adapter is explicitly
enabled.

```bash
pnpm fullstack:check
pnpm production:check
```

API details: `docs/API.md`. Machine-readable contract:
`openapi/powerchain.v1.json`.


The API runtime additionally provides bounded rate limiting, two-second
readiness caching, process-local metrics, chain-aware destination validation,
and restart-safe execution idempotency. Ambiguous executor results are never
blindly resubmitted.
