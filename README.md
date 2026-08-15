# PowerChain Token

**Version:** `1.0.0`

Production-oriented source workspace for the canonical **PowerChain (PWRC)**
Token-2022 asset on Solana and the Sui `wPWRC` bridge representation.

## Canonical PWRC

```text
Name                  PowerChain
Symbol                PWRC
Chain                 Solana mainnet-beta
Mint                  PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Token program         Token-2022
Decimals              9
Fixed supply          18,446,000,000 PWRC
Base units            18,446,000,000,000,000,000
Native transfer fee   250 bps / 2.5%
Native fee cap        1,000,000 PWRC
Mint authority        revoked
Freeze authority      disabled
```

Required Token-2022 extensions:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

The canonical verifier program is verification-only. It contains no PWRC mint
instruction.

## Helius

PowerChain includes server-side Helius integration for **Solana Devnet and
Mainnet Beta**:

```text
JSON-RPC
WebSockets
DAS API
```

Configure:

```env
PWRC_CLUSTER=devnet
HELIUS_ENABLED=true
HELIUS_API_KEY=
HELIUS_REQUEST_TIMEOUT_MS=10000
```

Production Mainnet:

```env
NODE_ENV=production
PWRC_CLUSTER=mainnet-beta
HELIUS_ENABLED=true
HELIUS_API_KEY=

# Independent verification provider/endpoint.
PWRC_RPC_URL_SECONDARY=
```

The API key remains server-side. PowerChain never returns credential-bearing
Helius URLs through its public API.

Read-only integration status:

```text
GET /api/v1/integrations/helius
```

Canonical PWRC data through Helius DAS:

```text
GET /api/v1/data/solana/pwrc/helius/asset
```

SDK:

```ts
import {
  createHeliusClient,
} from "@powerchain/sdk/helius";
```

See [`docs/HELIUS.md`](docs/HELIUS.md).

## Native PWRC verification

The verification stack supports:

```text
canonical Token-2022 profile
live finalized RPC observation
Token-2022 extension inspection
active transfer-fee verification
MetadataPointer / TokenMetadata verification
multi-RPC consensus
Solana genesis-hash network attestation
observation freshness checks
finalized-slot skew checks
deterministic SHA-256 evidence commitments
```

Useful checks:

```bash
pnpm native-token:check
pnpm native-token:observer:check
pnpm native-token:consensus:check
pnpm native-token:attestation:check
pnpm helius:check
```

## Repository

```text
apps/
  api/
  client/
  docs/

packages/
  protocol/
  sdk/
  runtime/
  native-token-client/
  bridge-integration/
  metaplex/
  cdp-user-wallet/

programs/
  token/
  pwrc-lock/

contracts/
  wpwrc/

config/
docs/
scripts/
tests/
```

## Install and validate

```bash
npm install --global pnpm@11.18.0
pnpm install

pnpm package:exports:check
pnpm workspace:graph:check
pnpm helius:check
pnpm native-token:check
pnpm full-program:check
pnpm typecheck
pnpm test
pnpm production:check
```

Solana/Sui build gates:

```bash
cargo test --workspace
anchor build
sui move build --path contracts/wpwrc
```

Do not treat source/syntax checks as substitutes for these dependency-aware
builds.

## API

```text
GET /api/v1
GET /api/v1/token
GET /api/v1/token/native-policy
GET /api/v1/metadata
GET /api/v1/network
GET /api/v1/integrations/helius
GET /api/v1/integrations/helius/health
GET /api/v1/data/solana/pwrc/helius/asset
GET /api/v1/bridge/status
GET /api/v1/release/status
```

OpenAPI:

```text
/api/v1/openapi.json
/swagger/openapi.yaml
/swagger.yaml
```

## Security model

- Secrets and RPC API keys are server-only.
- Native PWRC mint/freeze authorities remain disabled.
- Helius integration exposes read-only RPC/DAS methods only.
- Monetary writes are never blindly retried.
- Bridge settlement is finality- and reconciliation-gated.
- Mainnet release remains fail-closed until real build/deployment evidence
  exists.
- No program IDs, signatures, lockfiles, binaries, or deployment evidence are
  fabricated.

## Mainnet state

Check:

```bash
pnpm mainnet:status
```

Expected source-only state before real release artifacts exist:

```text
SOURCE_READY
buildReady=false
deploymentEvidenceReady=false
readyForMainnet=false
```

## Documentation

- [`docs/HELIUS.md`](docs/HELIUS.md) — Helius RPC/WebSocket/DAS
- [`docs/RPC.md`](docs/RPC.md) — RPC provider and retry policy
- [`docs/NETWORKS.md`](docs/NETWORKS.md) — Solana/Sui network configuration
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — environment variables
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — SDK/integration boundaries
- [`docs/SECURITY.md`](docs/SECURITY.md) — security model
- [`docs/MAINNET.md`](docs/MAINNET.md) — Mainnet qualification
- [`docs/DEVNET.md`](docs/DEVNET.md) — Devnet workflow
- [`docs/API.md`](docs/API.md) — API/OpenAPI
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md) — operational procedures

## Trusted network identity

Production RPC verification now separates **what the RPC reports** from
**what PowerChain expects the network to be**.

Configure trusted Solana genesis hashes through deployment policy:

```env
PWRC_SOLANA_DEVNET_GENESIS_HASH=
PWRC_SOLANA_MAINNET_GENESIS_HASH=
```

The expected value must come from independently reviewed network/deployment
configuration. PowerChain does not learn the expected genesis hash from the RPC
being verified.

Helius health now fails closed when the returned genesis hash differs from the
configured network identity.

For multi-RPC verification, the secondary endpoint must also come from a
different provider family. Two differently keyed Helius URLs do not count as
independent observers.

Useful checks:

```bash
pnpm solana:network-integrity:check
pnpm mainnet:manifest-bindings:check
pnpm helius:check
pnpm native-token:attestation:check
```


## Live native PWRC attestation API

PowerChain can now execute the complete native-token verification pipeline
through the API when production verification is configured:

```text
Helius primary RPC
→ independent secondary provider
→ Token-2022 mint observation
→ canonical PWRC profile verification
→ multi-RPC consensus
→ trusted genesis-hash validation
→ finalized slot / epoch attestation
→ deterministic consensusSha256
→ deterministic attestationSha256
```

Configuration status:

```text
GET /api/v1/token/native-verification
```

Live attestation:

```text
GET /api/v1/token/native-attestation
```

Required Devnet/Mainnet conditions include Helius primary infrastructure,
a trusted expected Solana genesis hash, and an independent secondary provider.

Runtime tuning:

```env
PWRC_NATIVE_VERIFY_MIN_OBSERVERS=2
PWRC_NATIVE_VERIFY_MAX_AGE_MS=60000
PWRC_NATIVE_VERIFY_MAX_SLOT_SKEW=128
```

The live route exposes hashes, slot range, epochs, and verification status only.
RPC credentials and provider URLs are not returned.

Validate source wiring with:

```bash
pnpm native-token:runtime:check
pnpm solana:network-integrity:check
pnpm native-token:attestation:check
pnpm helius:check
```


## Native PWRC transactions and utility

The SDK now builds **fee-aware Token-2022 transfers** for the canonical PWRC
mint. Destination associated token accounts can be created idempotently and the
transfer uses `TransferCheckedWithFee` so the expected Token-2022 fee is bound
into the instruction.

```ts
import {
  buildNativePwrcTransferPlan,
  buildUnsignedNativePwrcTransferTransaction,
} from "@powerchain/sdk/native-token-transactions";
```

The builder does not hold private keys and does not submit transactions.
Signing/submission remains wallet or application owned.

Helius priority-fee estimation is available through `@powerchain/sdk/helius`
using `getPriorityFeeEstimate`. The default policy level is `Medium`, and exact
serialized transactions may be supplied as Base64.

Read-only runtime policy:

```text
GET /api/v1/token/transfer-policy
GET /api/v1/token/utility-policy
```

PWRC utility authorizations support deterministic SHA-256 commitments,
idempotency keys, expiry, workload classification, exact unit pricing, and
user-defined maximum-spend bounds. The reusable compute-admission engine can
enforce request-rate, concurrency, payload, work-budget, and duplicate-request
limits without embedding private keys or payment submission.

Expensive live-provider endpoints use a tighter per-IP rate limit and native
attestation uses single-flight request coalescing plus a short bounded cache to
reduce RPC stampedes.

## Metaplex compatibility

PowerChain ships a canonical off-chain metadata document at
`metadata/metadata.json` and a compatibility verifier for the Metaplex Token
Metadata **Fungible** standard with the Token-2022 program ID.

Canonical metadata writes remain governance-controlled and are not exposed by
the public SDK.


## Transaction integrity

PWRC transfer planning can now create a deterministic transfer intent that
binds the wallet, destination, payer, amount, Token-2022 fee, blockhash,
last-valid block height, compute limit, priority fee, creation time and expiry.

Before wallet signing, `reviewUnsignedNativePwrcTransaction()` reconstructs the
expected transaction and compares the exact serialized Solana message. Any
unexpected instruction, recipient/fee change, compute-budget change, blockhash
change or fee-payer change fails review.

Utility/AI workloads also include a bounded TTL idempotency registry to reject
duplicate requests without allowing unbounded in-memory growth.

```bash
pnpm transaction:integrity:check
```


## correctness fixes

This release tightens existing production paths instead of expanding the
public write surface.

Key fixes:

- Native PWRC verification now treats the canonical Token-2022 mint extension
  profile as exact: duplicate and unexpected extensions fail verification.
- Healthy `CREATED` bridge intents no longer incorrectly require operator
  attention simply because source finality has not happened yet.
- Impossible bridge finality/reconciliation combinations are detected as
  inconsistent state.
- Bridge intents are capped at the canonical PWRC supply and direction must
  match the Solana/Sui chain-family pair.
- Unsigned transaction review no longer depends on Node `Buffer`, improving
  browser/wallet portability.
- Native transfer intents validate Solana public keys by decoded 32-byte length,
  not by base58-looking text alone.

Validate with:

```bash
pnpm hardening:check
pnpm transaction:integrity:check
pnpm native-token:check
pnpm bridge:safety:check
pnpm bridge:settlement:check
pnpm full-program:check
```


## bridge-policy hardening

Bridge deployment policy now uses the same canonical field validation and
commitment algorithm across the protocol and standalone API runtime. A golden
parity fixture prevents drift without making source-only API checks depend on
installed workspace package resolution.

Key protections:

- `maxPendingExposureBaseUnits` cannot exceed the canonical PWRC fixed supply.
- Solana bridge networks are restricted to `localnet`, `devnet`,
  `mainnet-beta`.
- Sui bridge networks are restricted to `localnet`, `devnet`, `testnet`,
  `mainnet`.
- governance approval threshold cannot exceed the configured maximum pending
  operation count.
- evidence maximum age cannot exceed governance proposal TTL.
- `/api/v1/bridge/policy-config` now exposes the deterministic canonical
  `policySha256`.
- native-token and bridge-policy OpenAPI responses use closed nested schemas
  rather than generic open objects.

Validate with:

```bash
pnpm hardening:check
pnpm bridge:policy:check
pnpm mainnet:manifest-bindings:check
pnpm production:check
```


## native policy hardening

Native PWRC multi-RPC consensus now validates every observed Token-2022 profile
inside the consensus function itself. Matching RPCs can no longer reach
consensus merely because they agree on the same invalid mint state.

Invalid observations are rejected with:

```text
PWRC_NATIVE_CONSENSUS_PROFILE_INVALID:<observer>:<reason>
```

The consensus commitment also uses locale-independent observer ordering.

The canonical native PWRC policy now has a deterministic
`POWERCHAIN_NATIVE_PWRC_POLICY_V1` SHA-256 commitment. Both the protocol and
standalone API implementation are pinned to the same golden parity fixture.

`GET /api/v1/token/native-policy` now exposes:

```text
metaplexProgramId
policySha256
```

so clients can commit to the exact Token-2022/Metaplex/fee/authority policy
instead of trusting an unversioned JSON object.

Validate with:

```bash
pnpm hardening:check
pnpm native-token:consensus:check
pnpm native-token:check
pnpm mainnet:manifest-bindings:check
pnpm production:check
```


## observation consistency

Live native-PWRC verification now records the finalized slot immediately before
the Token-2022 read sequence and again after all account, mint, metadata, epoch
and genesis reads complete.

Every observer snapshot binds:

```text
slotStart
slotEnd
slotSpan
```

A slot regression fails immediately, and excessive read-window drift fails
according to:

```env
PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW=128
```

This is a deployment safety bound, not a token-economic constant. Operators may
tighten it for their RPC topology.

Multi-provider observers are fetched concurrently to reduce unnecessary
cross-provider timing skew, but the operation remains fail-closed: a configured
observer failure aborts verification rather than silently reducing quorum.

The network attestation SHA-256 commitment now includes each observer's slot
range, making the consistency window auditable.

Validate with:

```bash
pnpm hardening:check
pnpm native-token:observer:check
pnpm native-token:attestation:check
pnpm native-token:consensus:check
pnpm production:check
```


## attestation hardening

Native-PWRC network attestation now validates Solana genesis hashes as actual
Base58 values that decode to exactly 32 bytes. Base58-looking strings with the
wrong decoded length are rejected.

Epoch handling is now explicit:

```env
PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW=1
```

The default allows snapshots on the same epoch or across one adjacent epoch
boundary. Two observers at epochs such as `900` and `999` fail with:

```text
PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_EXCEEDED
```

The SDK also computes one `evaluationNow` value and one attestation-policy
object and reuses them for evaluate/assert. This removes the prior freshness
boundary race where the second check could run milliseconds later.

The canonical evaluation timestamp is now included in the attestation SHA-256
commitment and returned as `evaluationAt`, making freshness evaluation
auditable.

Validate with:

```bash
pnpm hardening:check
pnpm native-token:attestation:check
pnpm native-token:observer:check
pnpm production:check
```


## fee and transaction runtime hardening

Native PWRC verification now observes both Token-2022 transfer-fee authorities:

```text
transferFeeConfigAuthority
withdrawWithheldAuthority
```

Production live verification requires an explicit expected policy for both:

```env
PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED=
PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED=
```

Use a Solana public key or the literal `null` when the expected authority is
revoked. No authority address is invented by the repository.

Transaction construction now shares reviewed PowerChain safety ceilings:

```text
compute unit limit <= 400,000
priority fee <= 1,000,000 micro-lamports / CU
```

The transfer-policy API no longer claims that a market exists merely because
the token is transferable. It distinguishes:

```text
transferable = true
dexTransferCompatible = true
tradeability = integration-ready
exchangeListingVerified = false
liquidityConfigured = false
```

Actual exchange listing and liquidity remain external operational evidence.

Mainnet readiness now also fails closed until the expected Token-2022 fee
authority policy has been configured.

Validate with:

```bash
pnpm hardening:check
pnpm native-token:runtime:policy:check
pnpm native-token:check
pnpm production:check
```


## Mainnet native-token evidence

Mainnet readiness now requires a **fresh verified native-PWRC attestation
artifact**, not only source configuration.

The live attestation response binds:

```text
canonical PWRC mint
native policy SHA-256
reviewed Mainnet genesis hash
independent RPC provider families
Token-2022 transfer-fee authority policy
multi-RPC consensus SHA-256
network attestation SHA-256
finalized slot range
epoch range
per-observer slot windows
evaluation timestamp
```

The repository ships only:

```text
config/mainnet/native-token-attestation.example.json
scripts/mainnet/capture-native-token-attestation.mjs
scripts/mainnet/verify-native-token-attestation.mjs
```

It intentionally does **not** ship
`config/mainnet/native-token-attestation.json`.

After performing the live Mainnet verification, save the API result to:

```text
reports/live-native-token-attestation.json
```

then bind it to the current source tree:

```bash
pnpm mainnet:native-attestation:capture
pnpm mainnet:native-attestation:verify
pnpm mainnet:status
```

The default release-evidence freshness window is one hour:

```env
PWRC_MAINNET_NATIVE_ATTESTATION_MAX_AGE_MS=3600000
```

The Mainnet state machine cannot advance to `EVIDENCE_READY` unless the native
token attestation verifies, its source-tree SHA matches, the provider families
are independent, the expected transfer-fee authority state matches deployment
policy, and the evidence is fresh.

The canonical release also fixes trusted Solana genesis validation so configured genesis hashes
must decode from Base58 to exactly 32 bytes.


## Helius reliability hardening

Helius read traffic now uses a shared in-process cooldown per network after any
HTTP `429` response. New reads wait behind the cooldown instead of each request
independently hammering the provider.

The cooldown uses the larger of:

```text
HELIUS_RATE_LIMIT_DELAY_MS
Retry-After response delay, when supplied
```

with a bounded 60-second maximum. HTTP `408` and `5xx` responses continue to
use bounded retry behavior.

Malformed successful JSON responses are normalized to:

```text
PWRC_HELIUS_RESPONSE_INVALID
```

instead of leaking parser errors.

The public Helius client object no longer exposes credential-bearing RPC/API/WSS
URLs. `JSON.stringify(client)` produces only safe network/retry metadata and
`secretsExposed=false`.

Helius health checks now:

1. verify genesis identity first,
2. fail before additional health calls on the wrong network,
3. coalesce concurrent health requests,
4. cache successful health results for a short TTL.

```env
HELIUS_HEALTH_CACHE_MS=15000
```

The canonical PWRC DAS lookup is also Mainnet-only; Devnet no longer attempts
to query the canonical Mainnet PWRC mint.

Validate with:

```bash
pnpm helius:security:check
pnpm helius:check
pnpm production:check
```


## program hardening

The on-chain program sources are now hardened as a separate release boundary.

### Solana PWRC verifier

`programs/token` remains verification-only. It still exposes no mint, transfer,
burn, or authority-mutation instruction, and now emits an auditable
`ProfileVerified` event containing the canonical mint, Token-2022 program,
decimals, supply and native transfer-fee constants after verification succeeds.

### Solana bridge admin program

`programs/pwrc-lock` remains an administration-only control-plane program with
**no custody or monetary bridge instructions**. The canonical release adds:

```text
singleton PDA state: seeds = ["bridge-state"]
stored PDA bump
governor/operator role separation
two-step governor transfer
pending-governor acceptance/cancellation
forced pause after governor acceptance
monotonic admin_sequence
checked sequence increments
no-op state-change rejection
unpause blocked during pending governor transfer
```

The bridge state cannot be initialized as an arbitrary collection of unrelated
accounts anymore; it is bound to the program-derived singleton state address.

### Sui wrapped controller

The Sui controller now adds matching administrative protections and bridge
input hardening:

```text
two-step governor transfer
forced pause after governor acceptance
pending governor cannot be overwritten
operator/pending-governor role collision rejection
zero source-message digest rejection
zero Solana recipient rejection
zero Sui mint recipient rejection
explicit sequence overflow protection
overflow-safe wrapped-supply ceiling check
```

A deterministic source policy is stored at:

```text
config/programs/policy.json
```

under:

```text
POWERCHAIN_PROGRAM_POLICY_V1
```

The policy SHA-256 is:

```text
d001fc2f47e5bb50e1edcb4163cdb6f42b49401ff337ddd9a0f535670d0303e5
```

Validate source policy and program invariants with:

```bash
pnpm programs:check
pnpm programs:test:source
pnpm programs:security:check
```

These checks do not replace `cargo test`, `anchor build`, or `sui move build`.


## security/runtime correctness

The canonical release fixes several cross-cutting correctness issues discovered after the program
upgrade.

### Deterministic commitments

`canonicalJson()` now rejects ambiguous or unsafe values instead of silently
hashing them into misleading commitments:

```text
NaN / Infinity
top-level undefined
functions / symbols
cyclic objects
non-plain object instances
```

Negative zero is normalized to zero. This hardens every policy, intent,
attestation and evidence SHA-256 that relies on canonical JSON.

A shared `assertSolana32ByteBase58()` utility now replaces duplicate loose
Base58 checks. Native transaction blockhashes, transfer intents and PWRC utility
wallet identities must decode to exactly 32 bytes.

### Fee/accounting safety

Fee quoting now rejects:

```text
principal above canonical PWRC supply
total source debit above canonical PWRC supply
negative Solana network fee
invalid chain-specific service-fee recipient
unreachable requested net amount
```

Solana fee recipients must be valid 32-byte Base58 public keys. Sui fee
recipients must be canonical 32-byte `0x` hex addresses.

### AI/utility and replay security

PWRC utility authorizations now have a maximum 15-minute validity window,
exact Solana wallet validation and a spend pre-check before multiplication.

Compute admission policies require positive request/concurrency/payload/work
capacity and reject zero requested work units.

The bounded idempotency registry validates its clock input and rejects negative,
non-integer, `NaN`, or expiry-overflow timestamps.

### Sui role-separation correction

The Sui wrapped controller no longer initializes governor and operator to the
same address. It starts with:

```text
governor = publisher
operator = 0x0
paused = true
```

A distinct non-zero operator must be configured before unpausing. No-op pause
changes are rejected.

Updated program policy SHA-256:

```text
d001fc2f47e5bb50e1edcb4163cdb6f42b49401ff337ddd9a0f535670d0303e5
```

Validate with:

```bash
pnpm security:runtime:check
pnpm security:runtime:test:source
pnpm programs:check
pnpm production:check
```


## live fee-epoch transaction safety

Token-2022 transfer fees are epoch-aware. A transaction should therefore not
blindly rely on repository constants if the live mint's active fee
configuration can change between observation and signing.

The canonical release adds deterministic live fee evidence:

```text
POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1
```

The evidence binds:

```text
epoch
finalized observed slot
observation timestamp
250 bps active fee
1,000,000 PWRC maximum fee
transfer-fee config authority
withdraw-withheld authority
SHA-256 commitment
```

`fetchNativePwrcMintObservation()` now returns `transferFeeEvidence` produced
from the **active** Token-2022 transfer fee selected for the observed epoch.

Production transaction construction should use:

```text
buildVerifiedNativePwrcTransferPlan()
buildVerifiedUnsignedNativePwrcTransferTransaction()
```

These fail closed when the evidence:

- is stale,
- is from another epoch,
- is too far behind the current finalized slot,
- no longer matches canonical PWRC fee policy,
- has an invalid deterministic commitment.

The original transaction builder remains available for tooling and explicit
offline construction, but the runtime policy reports:

```text
legacyBuilderAvailable = true
productionEvidenceRequired = true
```

Signing and submission remain wallet/application-owned; no server transaction
submission was introduced.

Validate with:

```bash
pnpm transaction:fee-epoch:check
pnpm transaction:fee-epoch:test:source
pnpm transaction-integrity:check
pnpm production:check
```


## Canonical release identity

PowerChain uses one canonical release identity:

```text
PowerChain PWRC
version 1.0.0
release channel stable
artifact powerchain-token-1.0.0.zip
```

Internal hardening/check filenames may retain historical iteration numbers for
release-manifest continuity, but those labels are **not package or token
versions**. All workspace `package.json` files, canonical configuration and
protocol constants use `1.0.0`.

Canonical release and asset configuration:

```text
config/version.json
config/release.json
config/token.json
config/assets.json
packages/protocol/src/constants.ts
```

### Wrapped PowerChain asset

The Sui wrapped representation uses the canonical asset identity:

```text
name      Wrapped PowerChain
symbol    wPWRC
decimals  9
genesis   0 base units
backing   1 PWRC base unit : 1 wPWRC base unit
metadata  https://token.powerchain.energy/metadata/wpwrc.json
image     https://token.powerchain.energy/assets/tokens/wpwrc.png
```

The repository includes the supplied wPWRC PNG at:

```text
assets/tokens/wpwrc.png
```

The local image SHA-256 is pinned in `config/assets.json` and
`config/release.json`.

Validate canonical release identity with:

```bash
pnpm version:check
pnpm canonical:release:check
pnpm metadata:check
pnpm production:check
```


## Native transfer intent re-verification

Unsigned PWRC transaction review now treats a supplied transfer intent as
untrusted input.

Before rebuilding or comparing the unsigned Solana message, the reviewer
reconstructs the canonical intent from its fields and verifies:

```text
release version = 1.0.0
canonical PWRC mint
exact 32-byte Solana owner/destination/payer/blockhash values
canonical decimal integer encoding
gross amount bounds
canonical native Token-2022 transfer fee
canonical net amount
block-height and compute-budget bounds
canonical timestamps and lifetime
deterministic intent SHA-256
```

Mutating fee, net, mint, amount encoding, compute policy or commitment now
invalidates the intent before expected-message reconstruction.

Validate with:

```bash
pnpm transaction:intent:integrity:check
pnpm transaction:intent:integrity:test:source
```

## Native attestation cache isolation

Live native-PWRC attestation caching is now keyed by a SHA-256 of the effective
verification configuration, including network, genesis identity, RPC endpoints,
observer/freshness policy, expected transfer-fee authorities and Helius
credential material. Secret-bearing configuration is used only as hash input
and is not returned.

Cache lifetime is capped by the native observation freshness policy, and the
attestation `evaluationAt` freshness is rechecked on every cache hit. In-flight
single-flight work is also configuration-keyed.

Validate with:

```bash
pnpm native-token:attestation-cache:check
pnpm native-token:attestation-cache:test:source
```


## Canonical Node and package toolchain

PowerChain `1.0.0` now pins the current Node.js runtime and package tooling:

```text
Node.js      26.5.1
nvm          0.40.6
npm          11.17.0
pnpm         11.18.0
TypeScript   7.0.2
```

Runtime version files:

```text
.nvmrc
.node-version
config/toolchain.json
```

Recommended setup:

```bash
nvm install
nvm use
npm install --global pnpm@11.18.0

node --version
pnpm --version
pnpm toolchain:check
pnpm packages:versions:check
```

The repository uses exact dependency versions and strict engine/peer checks.
`pnpm-lock.yaml` is intentionally **not fabricated**; generate it only through
a real install using the pinned Node/pnpm toolchain.

Direct package pins were refreshed where newer stable releases were verified:

```text
@types/node             26.1.2
zod                     4.4.3
@types/react            19.2.18
tsx                     4.23.1
typescript              7.0.2
@coinbase/cdp-core      0.0.120
@coinbase/cdp-hooks     0.0.120
```

The Solana client stack deliberately remains on the maintained web3.js 1.x
line because `@solana/spl-token` documents that its current package is paired
with `@solana/web3.js@1`:

```text
@coral-xyz/anchor       0.32.1
@solana/spl-token       0.4.15
@solana/web3.js         1.98.4
```

A future migration to `@solana/kit` should be handled as an explicit API
migration rather than silently mixing web3.js 2.x with the legacy SPL client.


### Node 26 package-manager note

Node.js stopped bundling Corepack starting with Node 25. The canonical Node
26 setup therefore does **not** assume that `corepack` exists.

With nvm installed:

```bash
nvm install 26.5.1
nvm use 26.5.1
npm install --global pnpm@11.18.0

node --version
npm --version
pnpm --version
```

Expected versions:

```text
node  v26.5.1
npm   11.17.0   # bundled with Node 26.5.1
pnpm  11.18.0
```

All workspace packages declare the same Node engine:

```text
>=26.5.1 <27
```

Type-only tooling remains in `devDependencies`; in particular
`@types/node@26.1.2` is no longer treated as a runtime dependency.


## Canonical token policy

PWRC economics and the wPWRC backing model are now bound by one deterministic
policy commitment:

```text
POWERCHAIN_PWRC_TOKEN_POLICY_V1
cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4
```

The policy pins fixed supply, u64 headroom, exact Token-2022 extension profile,
2.5% native fee/cap threshold, authority policy, metadata identity and the
zero-genesis 1:1 wPWRC representation.

See `docs/TOKEN.md` and validate with:

```bash
pnpm token:policy:check
pnpm token:policy:test:source
```


Canonical token API/SDK parity can be verified with:

```bash
pnpm token:api:check
pnpm token:api:test:source
```

`GET /api/v1/token/policy` is the complete PWRC/wPWRC policy endpoint.
`@powerchain/sdk/token` exposes the exact amount, policy and native-fee helpers
without duplicating protocol math.


Reviewed Mainnet Token-2022 authority policy:

```bash
pnpm token:fee-authorities:check
pnpm token:fee-authorities:test:source
pnpm mainnet:fee-authorities:seal
pnpm mainnet:fee-authorities:verify
```

The source tree ships only a fail-closed example. No authority address is
invented by the repository.
