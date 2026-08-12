# Changelog

## 1.0.0

- Canonical PowerChain (PWRC) Token-2022 monetary policy.
- Devnet-first and guarded mainnet deployment flows.
- Token-2022 metadata initialization.
- Exact 18,446,000,000 PWRC single genesis issuance.
- Freeze authority never enabled.
- Separate irreversible mint-authority finalization.
- Expected-mint guard for mainnet finalization.
- On-chain Token-2022 owner, decimals, supply, and authority verification.
- Transaction evidence capture and chain snapshots.
- Deterministic release hashes and release bundle.
- Version lock, metadata checks, u64 invariant tests, and CI validation.

### Production hardening

- Added qualified toolchain manifest (Agave 4.2.0 / SPL Token CLI 5.6.1).
- Added mainnet mint precommitment using an externally stored mint keypair.
- Added append-only SHA-256 chained deployment journal.
- Added deterministic input sealing before deployment.
- Added finalized transaction confirmation evidence checks.
- Added post-finalization journal verification.
- Expanded mainnet production checklist and interruption/recovery guidance.
- Release proof now commits to toolchain, input lock, journal and final transaction evidence.

### Client / Anchor integration

- Added `client/client.ts` and `client/index.ts`.
- Added `tests/anchor.test.ts`.
- Added pinned `@coral-xyz/anchor`, `@solana/web3.js`, `bs58`, and `axios` compatibility dependencies.
- Added finalized RPC mint verification and transaction evidence helpers.
- Added base58/JSON keypair decoding for local tooling without persisting secrets.

- Added typed PWRC/wPWRC bridge policy and 1:1 conservation verifier.
- Added Solana devnet/mainnet and Sui testnet/mainnet bridge identity templates.
- Added bridge client helper, bridge tests, bridge policy validator, and metadata/logo SHA-256 manifest.

- Changed canonical token website/domain to `https://token.powerchain.energy`.
- Changed primary PWRC/wPWRC metadata and logo URLs to `token.powerchain.energy`.
- Added configurable GitHub Raw secondary metadata fallbacks and Axios fallback client.
- Added metadata-source policy configuration, validation, tests, and refreshed SHA-256 manifest.
- Corrected official website to `https://powerchain.energy`; retained `https://token.powerchain.energy` exclusively as the token/metadata host.
- Added Anchor `programs/pwrc-fees` protocol-fee program with fixed 250 bps (2.5%) fee policy and 9-decimal PWRC validation.
- Added `config/fees.json`, TypeScript fee math, fee-config PDA and Solana instruction builders, program/fee tests, and `docs/PROGRAMS.md`.
- Added an optional Token-2022 `TransferFeeConfig` profile without enabling it on the canonical mint by default.
- Set canonical PWRC protocol fee collector owner to `FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy`; fee destination is its deterministic Token-2022 ATA for the canonical PWRC mint.
- Hardened protocol transactions with exact-byte simulation/submission, finalized blockhash-aware confirmation, receipt-based retry recovery, Token-2022 account preflight checks, immutable fee-vault configuration, source/destination separation, and canonical max-amount guards.
- Added secure AI-compute utility policy, x402 v2 integration policy, Circle CCTP v2 USDC settlement layer, and ZK/confidential-transfer governance policy. CCTP is explicitly separated from the PWRC/wPWRC bridge and canonical PWRC confidential transfers remain disabled by default.
- Added market/tradeability policy, universal zero-amount rejection, exact 9-decimal amount conversion, Pyth Hermes price adapter, Birdeye Solana price/V3 market-data adapter, and Pyth-to-Birdeye fallback market service.
- Added oracle confidence/divergence checks, liquidity and slippage gates, deterministic expiring trade quotes, verified multi-provider market snapshots, and a market circuit breaker.
- Added provider-health scoring, bounded read retries, hash-chained evidence envelopes, explicit production-readiness evaluation/reporting, and observability policy with secret-safe logging requirements.
- Replaced global zero-operation rejection with context-aware semantics: zero-value settlement is forbidden while signed messages, authentication, service, market-data, discovery, proof, simulation and other non-settlement operations may omit an amount or use zero. Added deterministic market/service IDs.
- Added Sui Move Currency-standard wPWRC package with zero genesis supply, immutable metadata, encapsulated TreasuryCap, capped bridge minting, burn return path, replay protection, emergency bridge pause, two-step authority rotation, TypeScript PTB builders, and testnet/mainnet deployment gates.
- Hardened wPWRC with fully bound Solana lock-claim hashes, pause-only authority governance, supply-after mint/burn events, OTW finalize-registration tooling, SHA-256 deployment manifests, transport-agnostic Sui deployment verification, and Solana-slot/Sui-checkpoint conservation evidence.
