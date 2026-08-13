# Release Process

## Release philosophy

PowerChain separates code quality, build integrity, deployment evidence and
release authorization.

The state machine is:

```text
SOURCE_READY
→ BUILD_READY
→ EVIDENCE_READY
→ AUTHORIZED
→ CONSUMED
```

## Source readiness

Run:

```bash
pnpm production:check
pnpm typecheck
pnpm test
```

Generate and verify source provenance:

```bash
pnpm release:provenance
pnpm release:provenance:verify
```

## Build readiness

Real build inputs must exist:

```text
pnpm-lock.yaml
contracts/wpwrc/Move.lock
target/deploy/pwrc_lock.so
target/deploy/pwrc_token.so
idl/generated/pwrc_lock.json
idl/generated/pwrc_token.json
idl/generated/wpwrc.modules.json
idl/release/1.0.0.json
```

Generate:

```bash
pnpm mainnet:build-manifest
pnpm mainnet:build-manifest:verify
```

The build manifest commits to file hashes and sizes.

## Deployment evidence

Prepare the template:

```bash
pnpm mainnet:evidence:prepare
```

Populate `config/mainnet/evidence.json` only from real build/chain observations.

Evidence includes:

- Solana canonical mint/program/vault state;
- Token-2022 authority/fee verification;
- Sui package, coin, controller and bridge authority;
- independent RPC observations;
- finalized slots/checkpoints;
- release/build/ABI hashes;
- operator/governor separation;
- Ed25519 signature.

Verify:

```bash
pnpm mainnet:evidence:verify
pnpm mainnet:evidence:bindings-verify
```

## Authorization

Prepare:

```bash
pnpm mainnet:authorization:prepare
pnpm mainnet:authorization:payload
```

Sign the 32-byte SHA-256 digest using the approved Ed25519 release key outside
the repository.

Then:

```bash
pnpm mainnet:authorization:verify
pnpm mainnet:authorization:unused-check
```

Authorization is short-lived and bound to:

- canonical mint;
- networks;
- evidence SHA-256;
- provenance SHA-256;
- build-manifest SHA-256;
- nonce;
- issue/expiry times.

## Preflight

```bash
pnpm pwrc:mainnet:status
pnpm pwrc:mainnet:preflight
```

A successful preflight creates a short-lived proof bound to the authorization
nonce.

## Consumption

Only at the actual point of no return:

```bash
pnpm mainnet:authorization:consume
```

Consumption is atomic and one-time.

## Never fabricate

Do not fabricate:

- lockfiles;
- generated IDLs;
- `.so` binaries;
- Move build output;
- package/program IDs;
- vault/controller IDs;
- authority values;
- signer identities;
- signatures;
- transaction signatures;
- RPC observations.
