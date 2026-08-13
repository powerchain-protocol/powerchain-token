# PowerChain `1.0.0` Production Operations

## Qualified configuration

The repository targets exact Node 22.22.3 compatibility baseline Current and pnpm 10.21.0, Anchor 0.32.1 and the reviewed Agave/Solana 2.3.0 profile recorded in `config/toolchain.json`. A different toolchain requires a fresh Devnet qualification before Mainnet use.

## Canonical asset

```text
Mint:       PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Program:    Token-2022
Decimals:   9
Supply:     18,446,000,000 PWRC
Fee:        250 bps / 2.5%
Fee cap:    1,000,000 PWRC
Metadata:   https://token.powerchain.energy/metadata/metadata.json
```

The mint address is configured but remains `provided-not-onchain-verified` until a production RPC verification run records the exact Token-2022 state.

## Safe transaction policy

Read-only RPC operations may retry bounded transient failures. Chain writes are simulated, submitted once, confirmed at `finalized`, and never blindly retried. An ambiguous submission must be reconciled by signature or durable bridge idempotency state.

## Mainnet

Mainnet is fail-closed. A dedicated HTTPS Solana RPC, secondary RPC for release evidence, verified mint/program/vault identities, Token-2022 fee authorities, generated Anchor IDLs, normalized Sui modules, reviewed Move.lock/Sui CLI build evidence, governance separation and release evidence are required before `pwrc:mainnet:preflight` can pass.

Automated Mainnet mint creation is intentionally disabled in `scripts/deploy.sh`. The reviewed canonical mint is verified with:

```bash
PWRC_MAINNET_RPC_URL=https://... pnpm pwrc:mainnet:verify-existing
```

## Devnet

Devnet creation is allowed only when the installed `spl-token` CLI exposes transfer-fee creation options. The created mint is immediately checked against the required Token-2022 extension, supply and fee profile. A failed profile check invalidates that Devnet mint.

```bash
pnpm pwrc:devnet:status
pnpm pwrc:devnet:preflight
```

## Build gates

```bash
pnpm production:check
pnpm typecheck
pnpm test
pnpm production:build:solana
pnpm production:build:sui
```

Do not claim build, deployment or Mainnet readiness unless those gates actually run and pass on the release workstation.

## Build phase vs deployment phase

Production build and deployment evidence are deliberately separated so release
checks do not create a circular dependency.

```bash
pnpm pwrc:devnet:prebuild
pnpm devnet:build

pnpm pwrc:mainnet:prebuild
pnpm mainnet:build
```

`mainnet:build` does **not** require already-deployed program/package IDs. It
does require the reproducible dependency lockfile and production source/config
policy. After real deployment and chain verification, run:

```bash
pnpm mainnet:release:check
```

That final release gate requires deployment identities, authority evidence,
generated Anchor IDLs, normalized Sui module evidence, and Mainnet preflight.

## pnpm build approvals

pnpm `10.21.0` blocks dependency lifecycle scripts unless they are explicitly
approved. PowerChain pre-approves only these reviewed packages:

```text
bigint-buffer@1.1.5
bufferutil@4.1.0
esbuild@0.25.12
utf-8-validate@6.0.6
```

The policy lives in `pnpm-workspace.yaml` under `onlyBuiltDependencies` with
`strictDepBuilds: true`. This resolves `ERR_PNPM_IGNORED_BUILDS` for the known
dependencies and fails closed if a future dependency introduces a new build
script.

```bash
pnpm pnpm:check
pnpm pnpm:ignored-builds
```

Do not use `dangerouslyAllowAllBuilds`.

## Telemetry

Next.js/Turbo build telemetry is disabled for repository production workflows:

```text
NEXT_TELEMETRY_DISABLED=1
TURBO_TELEMETRY_DISABLED=1
DO_NOT_TRACK=1
```

The settings are present in `.env.production`, example environments,
`next.config.mjs`, and CI.


## Portable doctor

`scripts/doctor.sh` supports macOS and GNU/Linux. SHA-256 is resolved through
`sha256sum`, `shasum -a 256`, or `openssl dgst -sha256`.

```bash
bash scripts/doctor.sh
pnpm pwrc:doctor:portability-check
pnpm pwrc:typescript:regression-check
```

The TypeScript regression gate covers the strict compiler issues fixed in this
release, including NodeNext JSON import attributes, index-signature environment
access, exact optional properties, and current fee-aware bridge test shapes.


## Runtime hardening

Production runtime helpers now include strict boolean/integer/enum environment
parsing, bounded read-retry attempts and delays, safe operation request IDs,
and a finalized-write recovery hook.

A monetary write is never blindly resubmitted. If submit transport fails after
a signature is known, the handler first reconciles that signature. A caller may
provide `recoverFinalizedResult` to reconstruct the result after confirmed
finalization without sending a second transaction.

Repository cache cleanup removes only known local build/cache outputs and does
not delete the pnpm store, dependency tree, deployment evidence, or release
artifacts.

```bash
pnpm pwrc:runtime:hardening-check
pnpm test:runtime-hardening
pnpm clean:cache
```


## Durable relayer state

`FileBridgeIdempotencyStore` and `FileReplayStore` persist replay/idempotency
reservations with exclusive-create semantics. A process restart therefore does
not reopen already-reserved bridge operations. `loadRecoverableBridgeOperations`
rehydrates non-terminal records in deterministic update order.

Writes to mutable JSON state use same-directory temporary files, file `fsync`,
and atomic rename. Monetary transaction reconciliation is also deadline-bounded;
timeout remains an ambiguous state and never triggers a blind resubmission.

Release provenance excludes build/cache outputs from its source-tree commitment,
adds a deterministic payload SHA-256, and can be reverified with:

```bash
pnpm release:provenance
pnpm release:provenance:verify
pnpm pwrc:relayer:durability-check
pnpm test:relayer-durability
```


## Root security controls

Release/build tooling shares the root `packages/runtime/src/` security primitives rather than
reimplementing them per script.

```bash
pnpm pwrc:security:hardening-check
pnpm test:root-security
pnpm pwrc:root:platform-check
```

Security-sensitive canonical JSON is strict: unsupported values, non-finite
numbers, cycles, undefined properties, and non-plain objects are rejected.
This avoids signing or hashing data whose serialized representation could be
ambiguous.

The shared process runner never enables a shell, bounds runtime/output, rejects
NUL-containing commands/arguments, and reports timeout separately from normal
nonzero exits.

Configuration readers enforce repository containment and reject direct symlink
configuration files. Generated mutable JSON reports use atomic same-directory
writes with randomized exclusive temporary names.

Structured logging redacts both secret-like object keys and common credentials
embedded inside free-form strings. Secrets must still never be intentionally
logged or committed.
