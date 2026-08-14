# PowerChain Operations

**Version:** `1.0.0`

## Daily source checks

```bash
pnpm canonical:check
pnpm config:check
pnpm fees:check
pnpm stack:check
pnpm production:check
```

## Devnet

```bash
pnpm devnet:preflight
pnpm devnet:status
```

A Devnet deployment is not considered qualified until both Solana and Sui
evidence records exist and Sui has been checked through the independent
verification path.

## Mainnet candidate

```bash
pnpm mainnet:build:verifiable
pnpm mainnet:build-manifest
pnpm mainnet:preflight
pnpm mainnet:verify:evidence
pnpm mainnet:verify:authorization
pnpm mainnet:status
```

`SOURCE_READY`, `BUILD_READY`, and `EVIDENCE_READY` are not deployment
authorization.

## Ambiguous writes

RPC timeouts or lost responses after a monetary submission do not imply that
the transaction failed. Persist the operation ID and reconcile against finalized
Solana or checkpointed Sui observations before allowing another write.


## Quote integrity

Fee quotes expose `issuedAt`, `expiresAt` and a deterministic
`quoteFingerprint`. Transaction preparation must reject an expired quote and
must not silently substitute fee recipients or monetary fields after the
fingerprint was presented to the user.

The API validates base-unit amounts against the `u64` range, restricts
operations to the supported allowlist, validates the configured Solana
service-fee recipient, and applies a bounded in-memory rate limiter.

## Evidence binding

Mainnet evidence hashes are compared against the actual release files.
Authorization hashes are then compared against the exact evidence and build
manifest files. This creates a direct chain:

```text
source/toolchain/lockfiles
→ build manifest
→ deployment evidence
→ release authorization
```

## Coinbase CDP Solana analytics

Configure the server-side Bearer credential:

```env
CDP_SQL_API_BEARER_TOKEN=
CDP_SQL_API_TIMEOUT_MS=10000
CDP_SQL_API_CACHE_MAX_AGE_MS=15000
```

Validate integration policy and query templates:

```bash
pnpm cdp:policy:check
pnpm cdp:check
```

Do not use CDP SQL query results as the sole source for bridge settlement or
Mainnet deployment evidence.
## Runtime lifecycle checks

Before deployment:

```bash
pnpm workspace:graph:check
pnpm package:exports:check
pnpm docs:runtime:check
pnpm shutdown:check
pnpm env:coverage:check
```

The API, client and docs HTTP servers all use the shared graceful-shutdown
helper. The full-stack supervisor waits for child processes to exit before
escalating termination.
