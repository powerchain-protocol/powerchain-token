# PowerChain `/idl`

Version `1.0.0`.

```text
idl/
├── manifest.json
├── manifest.sha256.json
├── anchor/
│   └── pwrc_lock.expected.json
├── schemas/
│   └── pwrc_lock.anchor.schema.json
├── sui/
│   └── wpwrc.interface.json
└── generated/
    ├── pwrc_lock.json       # only after real Anchor IDL generation
    └── pwrc_lock.sha256
```

`anchor/pwrc_lock.expected.json` is an expected contract surface, **not** a
fabricated generated Anchor IDL. It allows API drift checks when the Anchor
toolchain is unavailable.

Generate and sync the authoritative Anchor IDL:

```bash
pnpm idl:build
pnpm idl:sync
pnpm idl:check
pnpm idl:hash
```

The Sui JSON file is a source-level Move interface manifest. It deliberately
leaves package/object deployment IDs unset until verified deployment evidence
exists.

Never hand-author Anchor discriminators and never treat the configured
`powerchain` Sui address alias as the published package ID.


## Source drift

```bash
pnpm idl:drift-check
```

compares the Anchor expected interface and Sui interface directly against the
active Rust/Move source. Added or removed instructions, account contexts,
account types, events, or Sui entry functions become a failing check.

## ABI fingerprint

```bash
pnpm idl:fingerprint
```

writes `idl/abi.fingerprint.json` using domain-separated SHA-256 commitments.

## Strict generated verification

```bash
pnpm idl:generated:verify
```

fails when the generated Anchor IDL is missing and, when present, verifies its
instruction, argument, account, account-type, and event surface.


## Compatibility baseline

The public `1.0.0` interface is frozen in:

```text
idl/baseline/1.0.0.json
```

Run:

```bash
pnpm idl:compatibility
pnpm idl:check-all
```

before release changes.

## Release manifest

`pnpm idl:release` binds the source hashes, ABI fingerprint, expected Anchor
interface, Sui source interface, and real generated Anchor IDL into
`idl/release/1.0.0.json`.

The command fails closed until the generated Anchor IDL exists.


## Bindings

`idl/bindings/interface.ts` and `idl/bindings/manifest.json` provide a
source-derived public interface descriptor. They are intentionally marked as
non-encoding/non-deployment artifacts.

## Mainnet ABI binding

The Mainnet bridge configuration includes the combined ABI SHA-256 and requires
both a real generated Anchor IDL and normalized Sui module evidence before
release readiness can pass.


## Baseline checksum

`idl/baseline/1.0.0.sha256` pins the immutable public-interface baseline.

## Release artifact requirements

A release-ready IDL now requires **both**:

```text
idl/generated/pwrc_lock.json
idl/generated/wpwrc.modules.json
```

plus successful generated-IDL verification. Source-interface JSON alone is not
sufficient for production release readiness.
