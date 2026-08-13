# PowerChain Root Architecture

Version `1.0.0`.

The repository uses separate utility layers for different runtimes without
duplicating business logic.

```text
/
├── client/                 TypeScript clients
├── config/                 Versioned runtime/deployment policy
├── contracts/              Sui Move packages
├── docs/                   Architecture, production, Mainnet documentation
├── idl/                    ABI/IDL fingerprints and generated release artifacts
├── metadata/               Canonical PWRC/wPWRC metadata
├── packages/               Workspace packages
├── programs/               Solana Anchor programs
├── public/                 Public token assets
├── scripts/                Build, deployment, verification and release tooling
├── src/
│   ├── common/             Canonical TypeScript runtime implementations
│   └── utils/              Stable public utility re-exports
├── tests/                  Runtime/integration/release regression tests
├── utils/                  Canonical dependency-free Node/release utilities
└── reports/                Generated validation/evidence reports
```

## Utility ownership

`packages/protocol/src/common/` owns TypeScript runtime behavior. `packages/protocol/src/utils/` is a stable public
re-export layer and does not reimplement the same logic.

Root `packages/runtime/src/` owns dependency-free Node utilities used by `.mjs` build/release
scripts:

- atomic JSON/file writes;
- canonical JSON normalization;
- SHA-256 and cryptographic random bytes;
- HTTPS/RPC validation;
- repository-safe paths;
- structured redaction;
- timestamp/freshness policy;
- generic validation.

Legacy `scripts/lib/atomic-json.mjs` is only a compatibility re-export and must
not diverge from `packages/runtime/src/atomic-json.mjs`.

Run:

```bash
pnpm pwrc:root:check
pnpm pwrc:root:map
```


## Root platform services

The dependency-free root `packages/runtime/src/` layer also owns cross-script platform
services:

```text
utils/
├── atomic-json.mjs
├── canonical-json.mjs
├── config.mjs
├── constants.mjs
├── crypto.mjs
├── env.mjs
├── errors.mjs
├── logger.mjs
├── network.mjs
├── paths.mjs
├── process.mjs
├── redact.mjs
├── time.mjs
└── validation.mjs
```

`packages/runtime/src/process.mjs` always invokes child commands with `shell: false`, bounded
timeouts, bounded output buffers, and explicit failure policy.

`packages/runtime/src/logger.mjs` emits structured JSON and recursively redacts fields with
secret-like names before serialization.

`config/registry.json` is the central inventory for production configuration
documents and their minimum required keys.

Production checks:

```bash
pnpm pwrc:root:platform-check
pnpm pwrc:config:registry-check
pnpm pwrc:utils:duplication-check
```

Scripts should orchestrate these primitives instead of implementing their own
generic hash/config/process/logging helpers.


## Application layer

`apps/api` and `apps/client` are workspace applications. They consume the
repository's canonical root utilities and token/bridge configuration rather
than maintaining parallel economics or readiness state.

`apps/client` uses a same-origin reverse proxy for `/api/*`. This keeps server-only
executor URLs, API keys and inbound execution authorization outside the browser.

The API's execution path is gated separately from quoting:

```text
public quote
→ server recomputes canonical Token-2022 fee
→ Mainnet readiness
→ server-to-server bearer authentication
→ idempotency key
→ configured HTTPS external executor
→ no blind retry on ambiguous timeout
```
