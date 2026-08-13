# Troubleshooting

## `readyForMainnet` is false

Run:

```bash
pnpm pwrc:mainnet:status
```

Read the phase-specific blockers. A false Mainnet status is not necessarily a
source-code error.

Common pre-deployment blockers include missing:

```text
pnpm-lock.yaml
Move.lock
Anchor .so files
generated IDLs
normalized Sui modules
deployment evidence
release authorization
```

## API starts but execution is disabled

Check:

```text
GET /api/v1/bridge/capabilities
```

Execution requires Mainnet readiness plus all server execution variables.

## `PWRC_BRIDGE_API_AUTH_NOT_CONFIGURED`

Set the inbound server-only bearer token:

```text
PWRC_BRIDGE_API_AUTH_TOKEN
```

Do not expose it to browser code.

## `PWRC_BRIDGE_EXECUTION_NOT_READY`

Mainnet release gates are not all satisfied. Do not bypass this error.

## `PWRC_IDEMPOTENCY_KEY_CONFLICT`

The same key was reused for a different request. Use the original operation
record to reconcile. Do not mutate the stored request or reuse the key.

## `PWRC_EXECUTION_RECONCILIATION_REQUIRED`

The stored execution is non-terminal, usually `reserved` or `ambiguous`.

Do not blindly resubmit. Query the execution status and reconcile against the
executor/chain.

## `PWRC_BRIDGE_QUOTE_FINGERPRINT_MISMATCH`

Generate a new quote from the API and execute against that exact amount,
direction and fingerprint. Do not manually modify quoted monetary fields.

## Invalid destination address

Solana → Sui needs a full 32-byte Sui address.

Sui → Solana needs a base58 Solana address that decodes to 32 bytes.

## HTTP 413

The request exceeded the configured JSON/proxy body limit. Bridge execution
requests should be small; do not increase the limit to accommodate arbitrary
payloads.

## HTTP 429

Rate limit exceeded. Wait until the rate-limit reset rather than retrying in a
tight loop.

## API/web port in use

Override:

```text
PWRC_API_PORT
PWRC_WEB_PORT
```

or stop the existing process.

## Web cannot reach API

Check:

```text
PWRC_WEB_API_URL
```

Local HTTP is allowed for localhost. Non-local targets must be HTTPS.

## TypeScript cannot find Node/React/etc. types

This usually means the dependency graph is not installed or is stale. Run the
real pnpm install with the pinned Node/pnpm versions. Do not treat syntax-only
parsing as a substitute for typecheck.

## Anchor/Sui build unavailable

Install/activate the qualified chain toolchain and rerun the relevant toolchain
checker. Do not add placeholder generated files.

## Provenance verification fails

Regenerate provenance only after intentional source/config changes:

```bash
pnpm release:provenance
pnpm release:provenance:verify
```

Investigate unexpected hash drift before release.

## Pnpm ignored builds

Review:

```bash
pnpm pnpm:ignored-builds
pnpm pnpm:check
```

Approve only expected dependency build scripts.

## `production:check` fails only on bootstrap or telemetry

These checks are repository-policy checks and must not depend on developer-local
VS Code debugger injection or local `.env.production` contents.

Use the current implementation and run:

```bash
source scripts/bootstrap/activate-node.sh
pnpm production:check
```

The activation script clears known VS Code JavaScript Auto Attach `NODE_OPTIONS`
before invoking Node/Corepack.

Local environment drift can be reported as a warning, but it does not make the
release-source policy check fail.

