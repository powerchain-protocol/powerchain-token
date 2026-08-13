# Operations Runbook

## Normal service start

```bash
pnpm fullstack:start
```

Confirm:

```text
GET /api/v1/health
GET /api/v1/ready
GET /api/v1/bridge/capabilities
```

Do not infer Mainnet readiness from `/health`.

## Quote-only mode

Quote-only mode is the expected safe mode before Mainnet authorization.

Confirm:

```text
quote = true
execute = false
```

## Enabling execution

Execution should only be considered after the Mainnet release state is ready.

Required server configuration:

```text
PWRC_BRIDGE_EXECUTION_ENABLED=true
PWRC_BRIDGE_API_AUTH_TOKEN=<secret>
PWRC_BRIDGE_EXECUTOR_URL=<https URL>
PWRC_BRIDGE_EXECUTOR_API_KEY=<secret>
```

Then re-check `/api/v1/bridge/capabilities`.

## Execution request

Generate a fresh server quote, preserve its fingerprint, validate the
destination, and use a unique idempotency key.

Never reuse an idempotency key for a different request.

## Ambiguous execution

If execution returns an ambiguous timeout/network/upstream code:

1. do not submit again with a new key;
2. query the execution record with the original key;
3. reconcile against executor/chain state;
4. only transition the operation after verified evidence establishes the result.

The durable state intentionally prevents automatic resubmission.

## Rate limiting

HTTP 429 means the client exceeded the bounded fixed-window limit. Back off
until the reported reset time instead of immediately retrying.

## Mainnet readiness incident

If `readyForMainnet` changes from true to false:

1. stop new monetary execution;
2. inspect `/api/v1/mainnet/status`;
3. identify the failed phase;
4. do not bypass the gate;
5. regenerate/verify only the specific real artifact or evidence that changed;
6. create a new short-lived release authorization if the previous authorization
   is invalid, expired or consumed.

## Process shutdown

API handles SIGINT/SIGTERM, stops accepting new connections, closes idle
connections and forces exit after a bounded grace period.

The full-stack supervisor propagates shutdown to API and web processes.

## Evidence and reports

Generated reports are under `reports/`.

Ephemeral execution idempotency is under:

```text
runtime/api-idempotency/
```

Release authorization consumption records are under:

```text
deployments/mainnet/authorizations/
```

Do not delete unresolved ambiguous execution records merely to unblock a retry.

## Log handling

Logs are JSON and sanitized by the shared redaction layer. Store them with
appropriate access controls and retention. Never rely on redaction as the only
secret-management control.
