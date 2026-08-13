# PowerChain Mainnet Release

Version `1.0.0`.

The repository is **Mainnet-ready by design** but does not claim a Mainnet
deployment until build artifacts and on-chain evidence are independently
verified.

## Readiness phases

Mainnet status is split into three phases:

1. `codeReady` — source/configuration invariants pass.
2. `buildReady` — deterministic dependency/build/IDL artifacts exist and pass.
3. `deploymentEvidenceReady` — actual Solana/Sui deployment and governance
   evidence is complete, fresh, independently observed, and signed.
4. `releaseAuthorized` — a short-lived Ed25519 release authorization is bound
   to the exact evidence, provenance, build manifest, canonical mint, networks,
   nonce, and expiry.

`readyForMainnet` is true only when all four are true.

```bash
pnpm production:check
pnpm release:provenance
pnpm release:provenance:verify
pnpm mainnet:evidence:prepare
pnpm mainnet:evidence:verify
pnpm pwrc:mainnet:status
pnpm pwrc:mainnet:preflight
```

## Required build evidence

The release gate requires real artifacts:

```text
pnpm-lock.yaml
contracts/wpwrc/Move.lock
idl/generated/pwrc_lock.json
idl/generated/pwrc_token.json
idl/generated/wpwrc.modules.json
idl/release/1.0.0.json
reports/release-provenance-verification.json
```

These must come from the qualified toolchain. They must never be fabricated.

## Deployment evidence

Copy the evidence template:

```bash
pnpm mainnet:evidence:prepare
```

Then populate `config/mainnet/evidence.json` from verified chain/build results.
Do not place private keys or seed phrases in this file.

The evidence verifier checks:

- exact 32-byte Solana public keys;
- exact 32-byte Sui object/package IDs;
- canonical PWRC mint;
- HTTPS Mainnet RPC URLs;
- fixed 9-decimal supply/fee policy;
- revoked mint authority and null freeze authority;
- Token-2022 transfer-fee verification;
- executable/verified bridge program;
- verified bridge vault;
- Sui package/currency/controller/bridge authority;
- zero wPWRC genesis supply;
- distinct operator and governor;
- build/provenance/ABI SHA-256 commitments;
- Ed25519 signer public key and cryptographic signature over the canonical evidence payload.

## Fail-closed rule

A source tree that passes static checks is **not** a deployed Mainnet release.
The release is only Mainnet-ready when `reports/mainnet-status.json` contains:

```json
{
  "codeReady": true,
  "buildReady": true,
  "deploymentEvidenceReady": true,
  "releaseAuthorized": true,
  "readyForMainnet": true
}
```


## Build artifact manifest

After the qualified toolchain has produced real build artifacts:

```bash
pnpm mainnet:build-manifest
pnpm mainnet:build-manifest:verify
```

The manifest commits to:

```text
pnpm-lock.yaml
contracts/wpwrc/Move.lock
target/deploy/pwrc_lock.so
target/deploy/pwrc_token.so
idl/generated/pwrc_lock.json
idl/generated/pwrc_token.json
idl/generated/wpwrc.modules.json
idl/abi.fingerprint.json
idl/release/1.0.0.json
```

Mainnet `buildReady` cannot pass without both Anchor `.so` binaries and a
verified build manifest.

## Cryptographic release evidence

`config/mainnet/evidence.json` uses an Ed25519 public key in DER/SPKI base64
form. The release payload is canonicalized and SHA-256 hashed with the
`release.signedPayloadSha256` and `release.evidenceSignatureBase64` fields
excluded from the signed payload. The Ed25519 signature is verified over the
32-byte SHA-256 digest.

This prevents an arbitrary non-empty signer/signature string from satisfying
the Mainnet evidence gate.


## Independent RPC observations

Mainnet evidence requires two independently hosted RPC observations for both
Solana and Sui. The evidence captures finalized Solana slots, Sui checkpoints,
state SHA-256 commitments, allowed drift, and an observation timestamp.

The evidence gate rejects:

- primary and secondary RPCs on the same hostname;
- stale observations;
- excessive finalized slot/checkpoint drift;
- missing state commitments;
- `stateAgreement !== true`.

This prevents one RPC provider from being the sole source of truth for release
authorization.

## Release authorization

Verified deployment evidence does **not** itself authorize execution.

After build and deployment evidence are verified:

```bash
pnpm mainnet:authorization:prepare
# sign the emitted signedPayloadSha256 digest using the approved Ed25519
# release key outside this repository
pnpm mainnet:authorization:verify
```

The authorization is bound to:

```text
canonical PWRC mint
Solana mainnet-beta
Sui mainnet
deployment evidence SHA-256
release provenance SHA-256
build manifest SHA-256
random 256-bit nonce
issuedAt
expiresAt
```

Authorization lifetime is capped at 24 hours; the preparation command defaults
to one hour. Private release keys are never read by repository tooling.


## Evidence-to-artifact binding

Mainnet evidence is not accepted merely because its SHA-256 fields are
well-formed. The binding verifier recomputes and compares the actual local
release artifacts:

```bash
pnpm mainnet:evidence:bindings-verify
```

It binds deployment evidence to the release provenance, ABI fingerprint,
generated Anchor IDLs, normalized Sui modules, `pnpm-lock.yaml`, `Move.lock`,
and the deterministic Mainnet build manifest.

When deployment IDs are populated in `config/mainnet/bridge.json`, those IDs
must also match the signed evidence.

## Signing payload export

The repository never reads a private release key. Export the exact public
signing payload and digest with:

```bash
pnpm mainnet:authorization:payload
```

The output records the canonical payload, SHA-256 digest, Ed25519 algorithm,
and explicitly states that no private key is included.

## One-time authorization consumption

A verified Mainnet release authorization is single-use. Before the operation
that begins the authorized release, verify that its nonce has not been used:

```bash
pnpm mainnet:authorization:unused-check
```

At the point of no return, consume it atomically:

```bash
pnpm mainnet:authorization:consume
```

Consumption uses exclusive file creation under
`deployments/mainnet/authorizations/<nonce>.json`. A second attempt with the
same 256-bit nonce fails closed. The preflight gate requires the authorization
to still be unused.

Do not consume an authorization during an exploratory dry run. Consumption is
for the actual authorized Mainnet execution boundary.


## Release state machine

Mainnet release gates now resolve to one explicit state:

```text
SOURCE_READY
BUILD_READY
EVIDENCE_READY
AUTHORIZED
CONSUMED
```

The allowed sequence is strictly forward-only. A release cannot jump from
source readiness directly to authorization.

`reports/mainnet-status.json` includes both `releaseState` and
`authorizationConsumed`.

## Preflight proof

A successful Mainnet preflight writes:

```text
reports/mainnet-preflight-proof.json
```

The proof binds the verified authorization nonce and authorization file hash to
the successful readiness state. Authorization consumption requires a fresh
proof no older than five minutes and requires the release state to still be
`AUTHORIZED`.

This prevents a stale verification result from being reused after files or
release state have changed.

## Clock skew

Release authorization verification allows at most five minutes of clock skew
for `issuedAt` and `expiresAt`. Authorization lifetime is still capped at 24
hours, with the preparation command defaulting to one hour.


## Security-sensitive preflight execution

Mainnet preflight runs every release verifier through the shared shell-free
process runner with bounded execution time and output. A successful preflight
requires:

```text
codeReady = true
buildReady = true
deploymentEvidenceReady = true
releaseAuthorized = true
authorizationConsumed = false
releaseState = AUTHORIZED
```

Only then is `reports/mainnet-preflight-proof.json` created. The proof is
short-lived and bound to the authorization nonce. Authorization consumption is
atomic and single-use.
