# Changelog

## 1.0.0

- Canonical PWRC Token-2022 profile with fixed 18.446B supply and 9 decimals.
- Native Token-2022 transfer fee at 250 bps, capped at 1,000,000 PWRC.
- Separate PowerChain service-fee layer with explicit activation and recipient.
- Fee quote gross-up for PWRC-denominated service-fee settlement.
- Service fees excluded from ordinary wallet transfers and bridge backing.
- PWRC verifier identity `PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu`.
- Solana bridge-lock and verification-only Anchor programs.
- Sui wPWRC package scaffold with 9 decimals and zero genesis supply.
- API/client/docs full-stack applications.
- Mainnet fail-closed release gating.
- Hardened Localnet/Devnet/Mainnet network resolution, dedicated/secondary RPC and WebSocket policy, Solana program-ID/keypair verification, Devnet/Mainnet deploy/verify scripts, typed Sui deployment integration, wPWRC replay protection and bridge events, health-aware full-stack startup, structured Mainnet evidence/authorization validation, expanded .env/.gitignore policy and network/integration runbooks. PWRC version remains 1.0.0.
- Added canonical configuration drift detection, deterministic bridge operation/reconciliation traces, Devnet qualification status, Mainnet build-manifest generation, source-ID cross-checking, wPWRC source-policy verification, stricter production environment validation, and operations/security runbooks. Version remains 1.0.0.
- Added strict API fee-quote validation, deterministic expiring quote fingerprints, bounded rate limiting, Solana service-recipient validation, semantic Devnet evidence verification, improved Sui publish-object inference, actual-file hash comparison in Mainnet evidence, and authorization-to-evidence/build SHA-256 binding. Version remains 1.0.0.
- Added build-manifest verification against real source/artifact hashes and sizes, explicit one-time Mainnet release-authorization consumption, `CONSUMED` release state, authorization/evidence/build receipt binding, semantic Sui BridgeController type verification with dual-RPC digest comparison, and bridge-trace/state-machine regression checks. Version remains 1.0.0.
- Integrated Coinbase CDP SQL API for Solana Mainnet PWRC analytics: fixed `solana.transfers` / `solana.instructions` query templates, mint volume, wallet owner history, Token-2022 instruction context, server-only Bearer auth, bounded 90-day/1,000-row query policy, CDP cache controls, SDK proxy client, API routes, docs and production regression checks. Version remains 1.0.0.
- Upgraded API v1 with OpenAPI 3.1/Swagger JSON+YAML contracts, route discovery, platform/status/fee-policy endpoints, lightweight `/swagger` explorer, standardized error envelopes, API security headers, and runtime↔OpenAPI drift checks. Version remains 1.0.0.
- Hardened root `.gitignore` and rebuilt `.env.example` with complete safe Solana/Sui/wPWRC, RPC, program-keypair path, service-fee, bridge, Coinbase CDP SQL, app-port, release-gate and telemetry configuration. Added environment documentation. Version remains 1.0.0.
- Fixed monorepo root-source/IDL-binding validation regressions, added portable bootstrap/telemetry/layout checks, centralized the official Metaplex Token Metadata program ID, and introduced the clean `@powerchain/metaplex` workspace with pinned Umi/Token Metadata dependencies and read-only PWRC metadata helpers. Version remains 1.0.0.
