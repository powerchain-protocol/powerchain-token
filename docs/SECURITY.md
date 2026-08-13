# Security

This document is the consolidated high-level security guide. Specialized
security documents remain under `docs/`.

## Core principles

### Fail closed

Missing build artifacts, deployment evidence, signatures, RPC observations or
authorization prevent Mainnet readiness.

### No blind monetary retry

A submitted transaction/executor request may have landed even when the client
did not receive a success response. Ambiguous outcomes require reconciliation.

### Server-owned economics

The API recomputes canonical fee-aware quotes. Browser values are not treated as
authoritative monetary calculations.

### Server-only execution

Private executor configuration and execution authorization remain outside the
browser.

## Token security

The canonical Token-2022 profile requires:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

Forbidden extensions include:

```text
PermanentDelegate
MintCloseAuthority
DefaultAccountState
InterestBearingConfig
ScaledUiAmount
Pausable
NonTransferable
```

Mint/freeze/fee-authority assertions that depend on deployment state require
real chain verification.

## Bridge security

- chain-specific address validation;
- replay reservation;
- deterministic quote fingerprints;
- durable idempotency;
- no blind execution retry;
- finalized chain-state semantics;
- wrapped supply/backing conservation checks;
- zero wrapped genesis supply.

## API security

- bounded JSON body size;
- read/write rate limiting;
- server-only bearer authorization;
- mandatory idempotency key for execution;
- 30-second request timeout;
- 20-second executor timeout;
- defensive response headers;
- opt-in CORS;
- structured secret redaction;
- no credential forwarding from the browser proxy.

## Executor failure classification

Timeout, transport failure and executor 5xx are ambiguous. The persistent
record remains reconcilable instead of being automatically retried.

## Cryptographic release security

Release inputs use:

- deterministic SHA-256 commitments;
- strict canonical JSON;
- Ed25519 evidence signatures;
- signed build/evidence/provenance bindings;
- independent RPC observations;
- short-lived authorization;
- 256-bit nonce;
- atomic one-time authorization consumption.

## Filesystem/config security

Root tooling provides:

- repository path containment;
- symlink rejection for protected config reads;
- exclusive temporary-file creation;
- `fsync`;
- atomic same-directory rename;
- randomized temporary names.

## Secret redaction

Structured logging redacts common secret-bearing field names, bearer tokens,
credential assignments, and secret-like URL query values.

Redaction is defense in depth. Secrets should not intentionally enter logs.

## Operational security

Before Mainnet:

1. qualify exact toolchains;
2. generate real lockfiles/artifacts;
3. verify program/mint/vault/package/controller identities;
4. verify authorities;
5. observe state from independent RPC providers;
6. sign evidence using approved release keys;
7. create and sign a short-lived release authorization;
8. run Mainnet preflight;
9. consume authorization only at the actual execution boundary.

## Reporting

Do not publish private keys, seed phrases or credentials in issue reports.
Include sanitized request IDs, deterministic hashes, chain signatures/slots or
checkpoints, and non-secret verifier output.
