# PowerChain Token

Canonical source and release-policy repository for **PowerChain (PWRC) 1.0.0**.

PowerChain is a fixed-supply Solana Token-2022 asset with a Sui wrapped
representation, `wPWRC`. This repository contains the canonical token policy,
read-only verification/runtime tooling, bridge safety/control-plane logic,
Solana program sources, the Sui Move controller, SDK/API packages, release
evidence tooling, and production source gates.

> **Release status:** source-ready, not Mainnet-ready. The repository does not
> ship deployment evidence, compiled program binaries, production lockfiles,
> live native-token attestations, release authorization, or reviewed Mainnet
> transfer-fee authority identities.

## Canonical release

```text
Name                         PowerChain
Symbol                       PWRC
Version                      1.0.0
Release channel              stable
Canonical chain              Solana
Canonical network            mainnet-beta
Standard                     Token-2022
Mint                         PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals                     9
Fixed supply                 18,446,000,000 PWRC
Fixed supply base units      18,446,000,000,000,000,000
```

Required Token-2022 extensions:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

Canonical authority state:

```text
Mint authority after genesis   null / revoked
Freeze authority               null / disabled
Transfer-fee authorities       reviewed release evidence required
```

Canonical transfer fee:

```text
Basis points                  250
Percent                       2.5%
Maximum fee                   1,000,000 PWRC
Maximum fee base units        1,000,000,000,000,000
Nominal cap threshold         40,000,000 PWRC gross
Rounding                      ceil
```

The complete PWRC/wPWRC policy is committed under:

```text
POWERCHAIN_PWRC_TOKEN_POLICY_V1
cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4
```

Canonical files:

```text
config/release.json
config/token.json
config/token-policy.json
config/assets.json
config/fees.json
packages/protocol/src/constants.ts
packages/protocol/src/token-policy.ts
```

## Professional token description

**Canonical description**

> PowerChain (PWRC) is the native fixed-supply Token-2022 utility token of the PowerChain ecosystem. PWRC is designed for digital payments, settlement, cross-chain services, application utilities, protocol operations, and renewable-energy-related digital infrastructure. The token is built around transparent fixed-supply policy, deterministic transaction handling, and wallet-owned execution. PWRC does not represent equity, debt, dividends, ownership of energy assets, carbon credits, or a claim on company revenue.

**Short wallet / explorer description**

> PowerChain (PWRC) is the native fixed-supply Token-2022 utility token for payments, settlement, cross-chain services, applications, protocol operations, and renewable-energy-related digital infrastructure.

Description policy:

```text
POWERCHAIN_PWRC_TOKEN_DESCRIPTION_V1
786cf50005186f88da572a666add55ad43a682bb7ac6d8cd433fd01e55e614e5
```

The renewable-energy positioning describes supported ecosystem and digital
infrastructure use cases. PWRC does not itself represent ownership of renewable
energy assets, carbon credits, equity, debt, dividends, or company revenue.

Canonical description source:

```text
config/token-description.json
```

API:

```text
GET /api/v1/token/description
```

## Wrapped PowerChain

`wPWRC` is the Sui representation of canonical PWRC.

```text
Name                         Wrapped PowerChain
Symbol                       wPWRC
Chain                        Sui
Network                      mainnet
Decimals                     9
Genesis wrapped supply       0
Maximum wrapped exposure     18,446,000,000 PWRC-equivalent
Backing/accounting ratio     1:1 in base units
Supply model                 mint on verified lock
                             burn before canonical release
```

Metadata:

```text
https://token.powerchain.energy/metadata/wpwrc.json
https://token.powerchain.energy/assets/tokens/wpwrc.png
```

The repository includes the wPWRC icon at `assets/tokens/wpwrc.png`.

## Metadata

PWRC metadata:

```text
https://token.powerchain.energy/metadata/metadata.json
https://token.powerchain.energy/assets/tokens/pwrc-logo.png
```

The Token-2022 metadata pointer is expected to point to the canonical PWRC mint.
Metaplex is retained as compatibility/read tooling; it does not replace the
Token-2022 `MetadataPointer` + `TokenMetadata` identity.

## Repository layout

```text
apps/
  api/                    Read-only API and live verification surfaces
  client/                 Client package/application source
  docs/                   Documentation application source

packages/
  protocol/               Canonical token, bridge and security policy
  sdk/                    SDK facade and transaction/quote planning
  runtime/                Runtime helpers
  native-token-client/    Native PWRC observation/client logic
  bridge-integration/     Bridge integration helpers
  metaplex/               Metaplex compatibility
  cdp-user-wallet/        Coinbase CDP wallet integration

programs/
  token/                  Verification-only PWRC Anchor program
  pwrc-lock/              Solana bridge administration/control-plane program

contracts/
  wpwrc/                  Sui Move wrapped-token controller

config/
  token-policy.json       Canonical PWRC/wPWRC policy commitment
  programs/               Program capability policy
  mainnet/                Fail-closed release evidence templates/policy

metadata/                 PWRC and wPWRC metadata
swagger/                  Canonical OpenAPI 3.1 contract
scripts/                  Production, package, security and release gates
tests/                    Source/runtime regression tests
docs/                     Architecture, operations and integration docs
```

## Solana programs

### PWRC verifier

Source identity:

```text
PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

`programs/token` is **verification-only**. It does not mint, transfer, burn, set
authorities, or custody PWRC. `verify_profile` checks the canonical mint,
Token-2022 ownership, 9 decimals, fixed supply, revoked mint authority and
disabled freeze authority, then emits `ProfileVerified`.

Token-2022 extension and transfer-fee authority verification remains part of
the release/client verification layer.

### Bridge administration

Source identity:

```text
7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr
```

`programs/pwrc-lock` is an administration/control-plane program, not a complete
custody bridge. It uses a singleton `bridge-state` PDA, starts paused, separates
governor/operator roles, supports two-step governor transfer, forces pause after
governor acceptance, and uses checked administrative sequencing.

It deliberately exposes no PWRC custody, mint, release, or transfer instruction.

Source program IDs are **not** Mainnet deployment evidence.

## Native PWRC verification

The read-only native-token runtime verifies:

- canonical Solana network identity;
- canonical Token-2022 mint identity;
- exact supply, decimals and authority state;
- exact extension profile;
- active transfer-fee configuration;
- independent RPC provider-family observations;
- finalized slot/epoch consistency;
- deterministic observation/attestation commitments;
- reviewed Mainnet transfer-fee authority policy.

Live verification never signs or submits a transaction.

Key Token API routes:

```text
GET /api/v1/token
GET /api/v1/token/policy
GET /api/v1/token/metadata
GET /api/v1/token/fees
GET /api/v1/token/native-policy
GET /api/v1/token/native-verification
GET /api/v1/token/native-attestation
GET /api/v1/token/transfer-policy
GET /api/v1/token/utility-policy
```

Canonical Assets API:

```text
GET /api/v1/assets
GET /api/v1/assets/{symbol}
```

The asset registry contains canonical `PWRC` and wrapped `wPWRC`, and every
asset response is bound to the canonical token-policy SHA.

## Transaction safety

Native PWRC transaction construction is unsigned and wallet/application-owned.

The transaction layer includes:

- exact BigInt/base-unit amount handling;
- canonical fixed-supply bounds;
- deterministic transfer intents;
- backward-compatible verified transfer intents bound to live fee-epoch evidence;
- deterministic wallet-review bundles binding intent, fee evidence, preflight and unsigned message;
- canonical token-policy SHA binding;
- recent blockhash + last-valid-height binding;
- intent expiry and recomputation before review;
- Token-2022 `TransferCheckedWithFee` planning;
- live fee-epoch evidence for the production builder path;
- observation-bound preflight reports with canonical SHA-256 and freshness checks;
- deterministic unsigned-message equivalence review;
- application compute/priority-fee ceilings;
- no server-side signing or submission.

Canonical application ceilings:

```text
Compute-unit limit max              400,000
Priority price max                  1,000,000 micro-lamports/CU
Total priority fee max              400,000 lamports
```

## Bridge safety model

Bridge protocol/runtime logic is designed around explicit source/destination
finality, deterministic intents, reconciliation, conservation evidence,
idempotency, fail-closed safety state, governance and recovery policy.

Accounting:

- **Solana → Sui:** the amount received after the native Token-2022 fee is the
  principal eligible for lock/mint accounting.
- **Sui → Solana:** wPWRC is burned first; canonical PWRC release is separate
  and the Solana Token-2022 transfer fee applies on the release transfer.
- service fees are separate from bridge principal.

Public API routes do not expose bridge monetary/admin write operations.

## Reviewed Mainnet transfer-fee authority policy

Mainnet authority expectations are review evidence, not merely environment
variables.

Safe committed template:

```text
config/mainnet/token-fee-authorities.example.json
```

Real reviewed artifact:

```text
config/mainnet/token-fee-authorities.json
```

Policy domain:

```text
POWERCHAIN_MAINNET_TRANSFER_FEE_AUTHORITY_POLICY_V1
```

The example is deliberately `configured: false`. No authority address is
invented by the repository.

Prepare a reviewed artifact from a local draft:

```bash
cp config/mainnet/token-fee-authorities.example.json \
  config/mainnet/token-fee-authorities.draft.json

# Fill reviewed values, set configured=true, reviewedAt and reviewReference.

pnpm mainnet:fee-authorities:seal
pnpm mainnet:fee-authorities:verify
```

Captured native-token release evidence binds
`transferFeeAuthorityPolicySha256`.

## Toolchain

Canonical JavaScript toolchain configuration:

```text
Node.js       26.5.1
nvm           0.40.6
npm           11.17.0
pnpm          11.18.0
TypeScript    7.0.2
```

Node 26 does not bundle Corepack. Recommended setup:

```bash
nvm install 26.5.1
nvm use 26.5.1
npm install --global pnpm@11.18.0

node --version
npm --version
pnpm --version
```

Then install and validate:

```bash
pnpm install
pnpm toolchain:runtime:check
pnpm ui:ux:check
pnpm production:check
```

`pnpm-lock.yaml` must be generated by a real install with the canonical
toolchain. The repository does not fabricate lockfiles.

## Validation

Useful source/runtime gates:

```bash
pnpm version:check
pnpm canonical:release:check
pnpm toolchain:check
pnpm packages:versions:check

pnpm token:policy:check
pnpm token:api:check
pnpm token:api:v1:check
pnpm token:description:check
pnpm token:runtime:parity:check
pnpm token:policy-binding:check
pnpm token:fee-authorities:check
pnpm utility:wallet-auth:check

pnpm transaction:integrity:check
pnpm native-transfer:preflight:check
pnpm native-transfer:review-bundle:check
pnpm metadata:check
pnpm helius:client-safety:check
pnpm programs:security:check
pnpm openapi:check
pnpm production:check
```

Toolchain-dependent gates remain separate:

```bash
cargo fmt --check
cargo check
cargo test
anchor build
anchor test
sui move build --path contracts/wpwrc
```

Do not treat source/static gates as substitutes for those builds.

## Mainnet release state

Mainnet follows a fail-closed lifecycle:

```text
SOURCE_READY
  → BUILD_READY
  → EVIDENCE_READY
  → AUTHORIZED
  → CONSUMED
```

`SOURCE_READY` means the source/policy gates pass. It does **not** mean programs
are compiled, deployed, independently verified, or authorized for Mainnet.

Expected release blockers until real evidence exists include:

```text
pnpm-lock.yaml
Cargo.lock
contracts/wpwrc/Move.lock
target/deploy/pwrc_lock.so
target/deploy/pwrc_token.so
reports/mainnet-build-manifest.json
config/mainnet/evidence.json
config/mainnet/native-token-attestation.json
config/mainnet/token-fee-authorities.json
config/mainnet/release-authorization.json
config/mainnet/release-consumption.json
```

Check current state with:

```bash
pnpm mainnet:status
```


## Token Console UI

`apps/client` provides the lightweight public PowerChain token console. The
interface is dependency-free and intentionally read-only.

Current UX includes:

- responsive desktop/tablet/mobile navigation;
- light and dark themes with persisted preference;
- canonical PWRC status and policy identity;
- release/API status visibility;
- PWRC and wPWRC asset cards;
- exact BigInt fee quoting without floating-point token arithmetic;
- quick quote amounts, inline validation and retry states;
- accessible focus states, skip navigation, live regions and reduced-motion
  support;
- direct `/swagger` access through the client proxy.

Run the focused UI source gates with:

```bash
pnpm client:ui:check
pnpm client:ui:test:source
```

The UI does not connect a wallet, sign, submit, mint, bridge or mutate token
state.



## Token Console UI/UX

`apps/client` provides the lightweight PowerChain Token Console. It remains
dependency-light and read-only while presenting canonical token/API data in a
responsive interface.

Current UX surfaces include:

- responsive overview, assets, transaction-safety and fee-quote navigation;
- light/dark theme with system-theme synchronization and persisted preference;
- mobile safe-area quick actions;
- canonical token economics and asset registry cards;
- live runtime/release status and refresh timestamp;
- transaction-safety visualization backed by
  `GET /api/v1/token/transfer-policy`;
- deterministic review-bundle visibility without wallet signing/submission;
- searchable API discovery links for Token, Assets, Fees and Transfer Policy;
- accessible focus states, skip navigation, live regions and reduced-motion
  support;
- explicit offline/online feedback.

Validation:

```bash
pnpm client:uiux:check
pnpm client:uiux:test:source
```

The console intentionally does not expose wallet connection, signing or
transaction-submission actions. Transaction execution remains wallet/application
owned.



### Cacheable representations

Stable token, metadata, fee-policy and asset resources use strong SHA-256
ETags computed from the exact serialized response body. Request-scoped tracing
metadata is intentionally kept out of cacheable JSON bodies and returned in the
`x-request-id` response header instead.

Conditional requests support `If-None-Match`, including comma-separated
validators, wildcard matching and weak-validator comparison for GET/HEAD.
Matching resources return `304 Not Modified` with `ETag`, `Cache-Control` and
`x-request-id` headers.

```bash
pnpm api:cache-etag:check
pnpm api:rate-limit:check
pnpm api:cache-etag:test:source
```

## API and OpenAPI

Canonical API contract:

```text
swagger/openapi.json
swagger/openapi.yaml
```

OpenAPI version: `3.1.0`.

Runtime contract routes:

```text
GET /api/v1/openapi.json
GET /swagger/openapi.yaml
```

The API is intentionally read-only for token/bridge monetary and administrative
operations.

## Documentation

- [Token](docs/TOKEN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Security](docs/SECURITY.md)
- [Fees](docs/FEES.md)
- [Networks](docs/NETWORKS.md)
- [RPC](docs/RPC.md)
- [Helius](docs/HELIUS.md)
- [Metaplex](docs/METAPLEX.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Environment](docs/ENVIRONMENT.md)
- [Operations](docs/OPERATIONS.md)
- [Devnet](docs/DEVNET.md)
- [Mainnet](docs/MAINNET.md)
- [CDP User Wallet](docs/CDP_USER_WALLET.md)

## Release notes

See [CHANGELOG.md](CHANGELOG.md) for the consolidated `1.0.0` change history.

### API traffic control

The API uses bounded process-local token buckets and trusts forwarded client IPs only from explicitly configured proxy addresses. It does not claim distributed cross-replica rate limiting.

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for the full trust model, validation
boundaries and release-evidence requirements.

Never commit private keys, seed phrases, program keypairs, wallet credentials,
RPC credentials, Helius API keys, CDP secrets, or signer material.


## Client UI

`apps/client` provides the lightweight PowerChain token interface. The UI is
API-driven and includes:

- canonical PWRC token identity and supply metrics;
- PWRC/wPWRC asset registry cards;
- exact fee quote calculation;
- responsive mobile layouts;
- persistent light/dark theme;
- loading, error and copy-feedback states;
- direct Token, Assets and Swagger navigation.

The UI is read-only and does not connect a wallet, sign, submit, mint, bridge,
or perform administrative writes.

Validate its source invariants with:

```bash
pnpm ui:ux:check
pnpm ui:ux:test:source
```
