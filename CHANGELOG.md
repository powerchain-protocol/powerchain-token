# Changelog

All notable changes to the canonical PowerChain token repository are documented
here.

The project release version remains **`1.0.0`**. Historical internal hardening
iterations are implementation history, not separate product versions.

## [1.0.0]

### Canonical token identity

- Added a committed professional token-description policy under
  `POWERCHAIN_PWRC_TOKEN_DESCRIPTION_V1` (`786cf50005186f88da572a666add55ad43a682bb7ac6d8cd433fd01e55e614e5`), including digital payments,
  settlement, cross-chain services, application utilities, protocol operations,
  and renewable-energy-related digital infrastructure. The wording explicitly
  avoids claims of energy-asset ownership, carbon-credit ownership, equity, debt,
  dividends or company-revenue rights.
- Propagated the canonical description to PWRC/wPWRC metadata, Token and Assets
  API responses, SDK types, public UI copy and the new
  `GET /api/v1/token/description` endpoint without changing the monetary token
  policy commitment.

- Established **PowerChain (PWRC)** as the canonical Solana `mainnet-beta`
  Token-2022 asset.
- Canonical mint:
  `PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc`.
- Fixed supply: `18,446,000,000 PWRC`
  (`18,446,000,000,000,000,000` base units).
- Fixed decimals at `9`.
- Canonical extension profile is exactly `TransferFeeConfig`,
  `MetadataPointer`, and `TokenMetadata`.
- Mint authority policy is revoked after genesis; freeze authority is disabled.
- Canonical metadata URI and image are bound in token/config policy.
- Added deterministic `POWERCHAIN_PWRC_TOKEN_POLICY_V1` policy commitment:
  `cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4`.

### Token economics and amount handling

- Canonical native transfer fee fixed at `250` bps / `2.5%`.
- Maximum native transfer fee fixed at `1,000,000 PWRC`.
- Canonical nominal fee-cap threshold fixed at `40,000,000 PWRC` gross.
- Clarified `feeAtMaximum` versus `feeCapped` so ceil rounding below the
  nominal threshold does not alter the configured threshold semantics.
- Added exact BigInt token amount parsing/formatting utilities.
- API/SDK quote inputs now reject amounts above the actual fixed PWRC supply,
  not merely values above `u64`.
- Gross-up and total source-debit calculations are fixed-supply bounded.
- API fee calculation derives economics from canonical token policy instead of
  carrying independent numeric policy constants.

### Wrapped PowerChain

- Defined **Wrapped PowerChain (wPWRC)** on Sui with 9 decimals.
- Wrapped genesis supply is zero.
- Maximum wrapped exposure is bounded by canonical PWRC fixed supply.
- Canonical accounting ratio is 1:1 in base units.
- Added canonical wPWRC metadata and repository asset icon.
- Sui bridge controller starts paused, keeps the TreasuryCap inside the
  controller, enforces replay-protected Solana source-message evidence, and
  burns wPWRC before Solana release processing.
- Added two-step governor transfer, governor/operator role separation,
  zero-address/message rejection and overflow-safe sequencing.

### Solana program security

- `programs/token` remains verification-only and exposes no mint/transfer/burn
  or authority-mutation instruction.
- Added `ProfileVerified` audit event after canonical base-mint verification.
- `programs/pwrc-lock` is explicitly an administration/control-plane program,
  not a monetary custody bridge.
- Added singleton `bridge-state` PDA, paused-by-default state, distinct
  governor/operator roles, two-step governor transfer, cancellation, forced
  pause after governor acceptance, checked admin sequencing and no-op rejection.
- Added deterministic program capability policy and source gates.
- Program source identities are not treated as deployment evidence.

### Native Token-2022 verification

- Hardened the Helius read client with bounded response bodies, caller-owned
  `AbortSignal` cancellation, cancellation-vs-timeout error separation and
  monotonic per-client JSON-RPC request IDs while preserving read-only behavior.

- Added exact native mint verification for mint, Token-2022 ownership, decimals,
  supply, authorities, extension set, fee configuration and metadata identity.
- Added independent multi-RPC observation/consensus and provider-family checks.
- Added trusted Solana genesis identity verification.
- Added finalized observation windows, slot/epoch divergence checks and
  deterministic observation/attestation commitments.
- Added Helius RPC/WebSocket/DAS read-only integration with secret-safe client
  serialization, fixed 429 cooldown, bounded retry behavior and genesis-first
  health verification.
- Added live read-only native verification and attestation API surfaces.
- Added attestation freshness and process-local single-flight/cache protection.

### Transaction and quote integrity

- Added a backward-compatible verified transfer-intent layer under
  `POWERCHAIN_NATIVE_PWRC_VERIFIED_TRANSFER_INTENT_V1`, binding the original
  intent SHA to fee-epoch evidence, observed epoch/slot and reviewed
  fee-authority policy commitment.
- Added `POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1`, a deterministic
  wallet-review bundle binding token policy, verified intent, fee evidence,
  authority-policy commitment, preflight report and exact unsigned message.
  The bundle is explicitly non-authorizing, unsigned and non-submitting.

- Bound native transfer preflight reports to observation time/slot and added a
  canonical `reportSha256` plus freshness/tamper verification. Simulation/RPC
  diagnostics are normalized before entering the committed report; the report
  remains non-authorizing and contains no signature/submission capability.

- Added read-only native PWRC transfer preflight with Token-2022 ATA
  owner/mint/frozen-state checks, balance sufficiency, destination ATA
  compatibility, recent blockhash, network-fee and ATA-rent estimates, payer SOL
  checks and optional transaction simulation. Preflight never signs or submits.

- Added Token-2022 `TransferCheckedWithFee` unsigned transaction planning.
- Added deterministic transfer intents binding canonical mint, participants,
  amount, fee/net, blockhash lifetime, compute policy, timestamps and SHA-256.
- Transfer intents are reconstructed and re-verified before unsigned message
  review; caller-supplied intent fields are not trusted.
- Bound native transfer intents and fee quote fingerprints to the canonical
  PWRC token-policy SHA.
- Added live fee-epoch evidence for the production transaction-builder path.
- Added exact unsigned-message comparison before wallet signing.
- Added fixed application ceilings:
  - `400,000` compute units;
  - `1,000,000` micro-lamports/CU priority price;
  - `400,000` lamports total priority fee.
- Non-zero priority pricing requires an explicit compute-unit limit.
- Signing and submission remain wallet/application-owned.

### Bridge protocol and safety

- Added deterministic cross-chain intents and settlement lifecycle.
- Added explicit source/destination prepare, submit, finality and reconciliation
  phases.
- Added finality correlation, conservation evidence and deterministic
  reconciliation.
- Added fail-closed recovery rules with no blind monetary write retries.
- Added governance, safety, risk and audit control-plane policy.
- Added canonical supply/exposure limits, network allowlists and evidence-age
  policy.
- Bridge API surfaces remain read-only for monetary/admin actions.
- Corrected direction-sensitive fee accounting:
  - Solana→Sui uses post-Token-2022-fee principal;
  - Sui→Solana burns wrapped principal before canonical release, with the native
    Solana transfer fee applying on release.

### Token policy API and SDK

- Corrected cacheable API entity semantics: request-scoped `requestId` values
  now remain in `x-request-id` headers instead of stable JSON representations,
  strong ETags are calculated from the exact serialized entity body, and
  conditional GET/HEAD supports lists, wildcard and weak validators with
  documented `304 Not Modified` responses.

- Expanded the canonical `PowerChain Token API` namespace with token-scoped
  metadata and fee routes, trailing-slash support, and discovery links.
- Added `/api/v1/assets` and `/api/v1/assets/{symbol}` for the policy-bound PWRC
  and wPWRC registry, with closed OpenAPI schemas and stable 400/404 behavior.
- Refactored public metadata/native-fee identity to derive from canonical token
  policy rather than duplicate constants.
- Added typed SDK `tokenMetadata()`, `tokenFees()`, `assets()` and `asset()`
  methods.
- Upgraded the built-in `/swagger` explorer with search, tag filtering, route
  counts and direct Token/Assets navigation while keeping it dependency-free.

- Added `config/token-policy.json` as the canonical PWRC/wPWRC policy source.
- Added `GET /api/v1/token/policy` with a closed OpenAPI schema.
- Legacy `GET /api/v1/token/native-policy` now derives from the canonical policy
  while preserving its compatibility commitment.
- Compact `GET /api/v1/token` also derives from canonical policy.
- Added `@powerchain/sdk/token` exact amount, fee and policy facade.
- Added typed SDK access to token policy and bidirectional bridge quote routes.
- Added policy/runtime/API parity gates to prevent silent drift.

### Mainnet release evidence

- Mainnet release lifecycle is fail-closed:
  `SOURCE_READY → BUILD_READY → EVIDENCE_READY → AUTHORIZED → CONSUMED`.
- Added source-tree-bound build/deployment evidence tooling.
- Added live native-token release attestation capture and verification.
- Added reviewed Token-2022 transfer-fee authority policy under
  `POWERCHAIN_MAINNET_TRANSFER_FEE_AUTHORITY_POLICY_V1`.
- Replaced environment-variable-presence release gating with a reviewed
  `config/mainnet/token-fee-authorities.json` artifact.
- Safe committed authority template is deliberately `configured: false`.
- Added create-only sealing and deterministic policy verification.
- Captured native-token evidence binds `transferFeeAuthorityPolicySha256`.
- Optional environment authority values must exactly match reviewed policy.
- No authority address, program deployment, signature, transaction ID or release
  authorization is invented by the repository.

### Security and runtime hardening

- Replaced the API server's fixed-window traffic limiter with a bounded
  process-local token bucket, added explicit burst capacities, refill-derived
  retry timing and rate-limit policy headers.
- Added fail-closed trusted-proxy handling: forwarded client IPs are ignored by
  default and accepted only when the immediate proxy has an explicitly listed
  address and the forwarded chain passes bounded IP validation. No distributed
  rate-limit claim is made.

- Added a wallet-signable utility authorization envelope binding network,
  canonical PWRC mint/token-policy SHA, service, recipient, nonce,
  idempotency, workload, exact spend limits and 15-minute expiry; the
  envelope remains unsigned and wallet/application-owned.

- Canonical JSON commitment helpers reject unsupported/non-deterministic values.
- Added exact 32-byte Base58 Solana identity validation.
- Added fixed-supply and chain-specific recipient validation.
- Added utility authorization TTL/replay/idempotency controls.
- Added route rate limiting and fail-closed provider/RPC handling.
- Added browser-safe transaction comparison.
- Added explicit tradeability semantics:
  transfer compatibility does not imply verified exchange listing or liquidity.
- Kept all public token/bridge runtime operations read-only where monetary
  signing/submission would otherwise be required.

### Toolchain and dependency policy

- Canonical JavaScript toolchain:
  - Node.js `26.5.1`
  - nvm `0.40.6`
  - npm `11.17.0`
  - pnpm `11.18.0`
  - TypeScript `7.0.2`
- Added `.nvmrc`, `.node-version`, strict engine checks and preinstall toolchain
  guard.
- Corrected Node 26 setup to avoid assuming bundled Corepack.
- Propagated the Node 26 engine to workspace manifests.
- Moved type-only dependencies such as `@types/node` into `devDependencies`.
- Added shared strict TypeScript configuration.
- Added strict package/build-script policy and explicit esbuild approval/pin.
- Kept the existing compatible Solana web3.js 1.x + SPL Token stack rather than
  performing a partial `@solana/kit` migration.
- `pnpm-lock.yaml`, `Cargo.lock`, and `Move.lock` are generated only by real
  toolchains; no lockfile is fabricated.


### Client UI/UX

- Rebuilt the public token console around a responsive token/asset/fee workflow
  with stronger hierarchy, mobile navigation, persistent light/dark theme,
  release/API status, polished loading/error/retry states and accessibility.
- Upgraded PWRC asset presentation and the fee calculator with quick amounts,
  inline validation, exact BigInt formatting, policy/fingerprint display and
  clearer read-only/no-wallet messaging.
- Fixed `/swagger` navigation through the client server, restricted client proxy
  and static surfaces to GET/HEAD, rejected upstream redirects and stripped
  upstream `Set-Cookie`.
- Added `client:ui:check` and dependency-free source tests, including CSP
  compatibility and large-integer formatting guards.

### Documentation and release hygiene

- Refined the Token Console UI/UX with clearer visual hierarchy, responsive
  transaction-safety workflow, live transfer-policy status, improved light/dark
  theme controls, system-theme synchronization, mobile safe-area quick actions,
  endpoint discovery chips, refresh timestamps and online/offline feedback.
- Added accessible focus/live-region behavior and retained reduced-motion
  handling. The interface remains read-only and exposes no wallet signing or
  transaction-submission action.

- Rebuilt the lightweight client UI with a professional responsive token
  dashboard, PWRC/wPWRC asset cards, API-backed token metrics, improved fee
  quote states, persistent light/dark theming, mobile behavior and accessible
  copy/error/loading feedback.
- Upgraded the technical docs runtime with responsive navigation and persistent
  theming.
- Upgraded the built-in Swagger explorer with a structured API overview,
  responsive filters, persistent theme, route-copy controls and clearer empty
  and failure states.
- Added client browser security headers and a dedicated UI/UX production gate.

- Consolidated the root README around canonical `1.0.0` identity and current
  source/release state.
- Removed stale internal iteration labels from program README headings.
- Clarified verification-only versus control-plane versus monetary capabilities.
- Added focused documentation for token policy, fees, security, networks,
  RPC/Helius, Metaplex, operations, Devnet and Mainnet.
- Changelog is consolidated under the single canonical `1.0.0` release rather
  than presenting internal hardening iterations as versions.

### Validation status

Current source/static gates are expected to pass before packaging.

The following are **separate release gates** and must not be inferred from
source/static validation:

- dependency install and generated `pnpm-lock.yaml`;
- dependency-aware TypeScript build/test;
- `cargo fmt`, `cargo check`, `cargo test`;
- Anchor build/test;
- Sui Move build/test;
- compiled Solana program binaries;
- verified deployment evidence;
- live native-token attestation;
- reviewed Mainnet transfer-fee authority artifact;
- release authorization and consumption evidence.
