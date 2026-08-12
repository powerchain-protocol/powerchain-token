# PowerChain `/idl`

**Version:** `1.0.0`

The `/idl` directory separates checked-in **expected source interfaces** from
real toolchain-generated Anchor/Sui artifacts. Expected JSON is used for drift
and compatibility checking; it never substitutes for a generated deployment
artifact.

## Structure

```text
idl/
├── README.md
├── manifest.json
├── manifest.sha256.json
├── abi.fingerprint.json
├── baseline/
│   ├── 1.0.0.json
│   └── 1.0.0.sha256
├── anchor/
│   ├── pwrc_lock.expected.json
│   └── pwrc_token.expected.json
├── schemas/
│   ├── pwrc_lock.anchor.schema.json
│   └── pwrc_token.anchor.schema.json
├── sui/
│   └── wpwrc.interface.json
├── bindings/
│   ├── interface.ts
│   └── manifest.json
├── attestations/
│   └── 1.0.0.unsigned.json
├── release/
│   └── 1.0.0.json
└── generated/
    ├── pwrc_lock.json          # real Anchor-generated artifact
    ├── pwrc_lock.sha256
    ├── pwrc_token.json         # real Anchor-generated artifact
    ├── pwrc_token.sha256
    └── wpwrc.modules.json      # normalized Sui module evidence
```

Generated files may be absent until the corresponding toolchain build succeeds.

## Expected Anchor interfaces

`anchor/pwrc_lock.expected.json` and `anchor/pwrc_token.expected.json` describe
what the Rust source is expected to expose. They are **not hand-authored Anchor
IDL replacements** and must not contain invented discriminators.

The canonical token-verifier interface also binds the current PWRC policy:

```text
Canonical mint:       PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals:             9
Transfer fee:         250 bps
Maximum fee:          1,000,000 PWRC
Required extensions:  TransferFeeConfig, MetadataPointer, TokenMetadata
```

## Sui source interface

`sui/wpwrc.interface.json` is a source-level Move interface contract. Published
package/object IDs remain unresolved until verified deployment evidence exists.
The configured `powerchain` address alias is not automatically a package ID.

## Source drift

```bash
pnpm idl:drift-check
pnpm idl:token:check
```

These checks compare expected interfaces with active Rust/Move source and fail
on unexpected instruction, account, event, or Sui entry-function changes.

## Compatibility baseline

The public `1.0.0` interface policy is pinned by:

```text
idl/baseline/1.0.0.json
idl/baseline/1.0.0.sha256
```

Run:

```bash
pnpm idl:baseline:check
pnpm idl:compatibility
pnpm idl:classify
```

Breaking interface changes must not be hidden by rewriting the baseline.

## ABI fingerprint

```bash
pnpm idl:fingerprint
pnpm idl:hash
```

The combined ABI fingerprint binds:

- `pwrc_lock` expected Anchor interface;
- `pwrc_token` expected Anchor interface;
- Sui `wpwrc` source interface.

## Generate Anchor IDLs

With the qualified Anchor toolchain installed:

```bash
pnpm idl:build
pnpm idl:sync
```

The build/sync workflow expects real generated artifacts for both:

```text
target/idl/pwrc_lock.json
target/idl/pwrc_token.json
```

`idl:sync` verifies generated output before treating it as an IDL artifact.

## Strict generated verification

```bash
pnpm idl:generated:verify
pnpm idl:discriminators
pnpm idl:sui-normalized
```

These checks fail closed when real generated artifacts are missing. Anchor
instruction discriminators are verified from generated IDLs rather than
invented in source manifests.

## Bindings

`idl/bindings/` contains source-derived compile-time descriptors only. They are
not transaction codecs and are not deployment evidence.

Runtime transaction encoding requires verified generated Anchor IDLs. Sui
execution readiness requires a verified normalized ABI and package ID.

## Release manifest

```bash
pnpm idl:check-all
pnpm idl:release
pnpm idl:readiness
```

`idl/release/1.0.0.json` can report `release-idl-ready` only when the source
checks pass and all required generated artifacts are present and verified:

```text
idl/generated/pwrc_lock.json
idl/generated/pwrc_token.json
idl/generated/wpwrc.modules.json
```

Source-interface JSON alone is insufficient.

## Attestation

```bash
pnpm idl:attestation
pnpm idl:attestation:verify
```

The checked-in attestation payload is deliberately unsigned unless an
authorized external release signer is used. An unsigned SHA-256 commitment is
release evidence, not a deployment signature.
