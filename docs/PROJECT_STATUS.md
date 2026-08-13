# Project Status

**Version:** `1.0.0`

This document describes the packaged source state, not an assertion of a
deployed Mainnet system.

## Validated source/runtime state

```text
Production checks     53/53 PASS
TypeScript syntax     219 files PASS
Full-stack static     PASS
Full-stack runtime    PASS
Full-stack live       PASS
Release provenance    VERIFIED
```

## Mainnet status

```text
codeReady                 true
buildReady                false
deploymentEvidenceReady   false
releaseAuthorized         false
authorizationConsumed     false
releaseState              SOURCE_READY
readyForMainnet           false
```

## Current blockers

- `pnpm-lock.yaml`
- `contracts/wpwrc/Move.lock`
- `target/deploy/pwrc_lock.so`
- `target/deploy/pwrc_token.so`
- `idl/generated/pwrc_lock.json`
- `idl/generated/pwrc_token.json`
- `idl/generated/wpwrc.modules.json`
- `idl.releaseManifest:not-ready`
- `mainnet.build-manifest-verification:failed`
- `evidence:missing:config/mainnet/evidence.json`
- `evidence-bindings:missing:config/mainnet/evidence.json`
- `authorization:missing:config/mainnet/release-authorization.json`
- `authorization-unused:missing:config/mainnet/release-authorization.json`

These blockers are intentionally not replaced by placeholder artifacts.

## Implemented full-stack capabilities

- health/readiness/version/token endpoints;
- process metrics;
- Mainnet status exposure;
- canonical fee-aware bridge quotes;
- deterministic quote fingerprints;
- chain-specific destination validation;
- server-only authenticated bridge execution adapter;
- durable execution idempotency;
- ambiguity-safe reconciliation state;
- same-origin browser API proxy;
- live integration test.

## Not claimed

The package does not claim that the missing Mainnet program/package IDs,
authorities, generated binaries, generated IDLs, deployment signatures or
release authorization already exist.
