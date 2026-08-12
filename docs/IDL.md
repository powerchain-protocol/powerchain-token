# IDL and Interface Management

PowerChain `1.0.0` separates expected source interfaces from generated
toolchain artifacts.

Anchor's IDL is generated from the program build/IDL build. The repository's
expected manifest is used only for drift detection. The generated JSON is
synced into `idl/generated/` only after the actual Anchor toolchain produces
`target/idl/pwrc_lock.json`.

The Sui interface is source-level until a real Move build/publish provides
verified package and object identities.

Commands:

```bash
pnpm idl:check
pnpm idl:hash
pnpm idl:build   # requires Anchor
pnpm idl:sync    # requires generated target/idl/pwrc_lock.json
```


Production IDL checks:

```bash
pnpm idl:drift-check
pnpm idl:fingerprint
pnpm idl:check-all
pnpm idl:generated:verify
```

`idl:generated:verify` requires an actual generated Anchor artifact; it is not
satisfied by the expected-interface JSON.


## IDL compatibility baseline

`idl/baseline/1.0.0.json` freezes the public Anchor/Sui interface contract for
version `1.0.0`.

```bash
pnpm idl:compatibility
```

fails when an existing instruction, account type, event, argument ordering,
instruction account ordering, or Sui entry function is removed or changed
without a version change.

## Release binding

```bash
pnpm idl:release
```

creates `idl/release/1.0.0.json` only when source drift and compatibility checks
pass. It intentionally remains blocked until a real generated Anchor IDL is
present.

Additional strict gates:

```bash
pnpm idl:discriminators
pnpm idl:sui-normalized
```

Both require real toolchain-generated artifacts and fail closed when those
artifacts are missing.


## Client bindings

`idl/bindings/` contains source-derived interface descriptors for compile-time
feature discovery. These are not transaction codecs and do not replace
Anchor-generated client types.

```bash
pnpm idl:bindings:check
```

Transaction encoding remains blocked until the real generated Anchor IDL exists.

## Upgrade classification

```bash
pnpm idl:classify
```

classifies interface changes as `compatible`, `additive`, or `breaking`. A
breaking change is rejected while the project version remains `1.0.0`.

## Release attestation

```bash
pnpm idl:attestation
```

creates an unsigned deterministic attestation payload binding source hashes,
interface hashes, ABI fingerprint, and compatibility status.

The attestation is deliberately unsigned until an authorized release signer is
used outside this source-generation step.


## Baseline integrity

The frozen `1.0.0` compatibility baseline has its own SHA-256 commitment:

```text
idl/baseline/1.0.0.sha256
```

Run:

```bash
pnpm idl:baseline:check
```

This prevents silently editing the baseline to make a breaking change appear
compatible.

## Runtime guards

`src/idl/runtime.ts` prevents application code from treating source-derived
bindings as verified runtime ABIs. Anchor transaction encoding requires a
verified generated IDL hash; Sui execution requires a verified normalized ABI
and package ID.

## Readiness

```bash
pnpm idl:readiness
```

reports three separate states:

- static interface readiness;
- toolchain-generated artifact readiness;
- release readiness.

Mainnet readiness additionally requires `idl/release/1.0.0.json` to report
`release-idl-ready`.
