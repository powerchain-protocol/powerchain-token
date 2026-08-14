# Coinbase CDP SQL API — Solana PWRC Data

**PowerChain version:** `1.0.0`  
**Network:** Solana Mainnet  
**Provider:** Coinbase Developer Platform SQL API  
**Status:** public beta

PowerChain uses the CDP SQL API as an optional, server-side indexed-data source
for canonical PWRC activity. It does **not** replace Solana RPC as the authority
for transaction finality, program state, mint authority, supply, deployment
evidence, or bridge release authorization.

## Coverage

The integration uses:

```text
solana.transfers
solana.instructions
```

for SPL Token / Token-2022 transfer activity and decoded token instructions.

Canonical identifiers:

```text
PWRC mint
PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc

Token-2022
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

SPL Token
TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

System
11111111111111111111111111111111
```

Solana SQL support is beta. PowerChain therefore treats this integration as
analytics/indexing data only. The supplied Solana documentation describes
approximately three months of retained history and notes that the schema may
evolve during beta.

## Authentication

The CDP REST endpoint is called only by `apps/api`.

```env
CDP_SQL_API_BEARER_TOKEN=
CDP_SQL_API_URL=https://api.cdp.coinbase.com/platform/v2/data/query/run
CDP_SQL_API_TIMEOUT_MS=10000
CDP_SQL_API_CACHE_MAX_AGE_MS=15000
```

`CDP_SQL_API_BEARER_TOKEN` must never be exposed to `apps/client`.

The implementation accepts a pre-generated Bearer credential. Credential
generation/rotation stays outside browser code.

## API endpoints

PowerChain exposes fixed, validated query surfaces rather than accepting raw
SQL from clients.

### PWRC transfers

```text
GET /api/v1/data/solana/pwrc/transfers?days=7&limit=100
```

Returns recent active transfer rows for the canonical PWRC mint.

### PWRC daily volume

```text
GET /api/v1/data/solana/pwrc/volume?days=7
```

Aggregates:

```text
day
transfer_count
volume_base_units
```

### PWRC Token-2022 instructions

```text
GET /api/v1/data/solana/pwrc/instructions?days=7&limit=100
```

Joins `solana.instructions` to `solana.transfers` through `instruction_id` so
the PWRC mint filter does not depend on an assumed instruction-level mint
column.

The query scopes to:

```text
Token-2022 program
transfer
transferChecked
action = 1
```

### Transfer + instruction context

```text
GET /api/v1/data/solana/pwrc/transfer-context?days=7&limit=100
```

Reconstructs PWRC transfers with the decoded originating instruction.

### Wallet history

```text
GET /api/v1/data/solana/wallet/transfers?wallet=<owner>&days=7&limit=100
```

Optional PWRC-only mode:

```text
&pwrcOnly=true
```

Wallet queries use `source_owner` / `destination_owner`, not token-account
addresses.

## Query safety

The API never accepts user-supplied SQL.

All SQL is produced from fixed templates in:

```text
apps/api/lib/cdp-solana-sql.mjs
```

Guards include:

- Base58 Solana address validation before SQL interpolation;
- integer-only `days` and `limit`;
- maximum 90-day query window;
- maximum PowerChain endpoint limit of 1,000 rows;
- time-bounded queries;
- `action = 1` active-row filtering;
- server-only Bearer credential;
- HTTPS-only CDP endpoint;
- 1–30 second request timeout;
- configurable CDP query cache age, capped at 15 minutes;
- no DDL/DML/raw SQL route.

The PowerChain 1,000-row limit is intentionally stricter than the upstream SQL
API maximum.

## Caching

Requests send:

```json
{
  "sql": "...",
  "cache": {
    "maxAgeMs": 15000
  }
}
```

This reduces repeated indexed-data work while keeping the freshness tolerance
explicit. Set `CDP_SQL_API_CACHE_MAX_AGE_MS=0` when an uncached query is
required.

## SDK

Browser/application code uses the PowerChain API proxy, never Coinbase
credentials directly:

```ts
import {
  createPowerChainDataClient,
} from "@powerchain/sdk";

const data =
  createPowerChainDataClient();

const transfers =
  await data.pwrcTransfers(
    7,
    100,
  );

const volume =
  await data.pwrcVolume(7);
```

## Trust boundary

CDP SQL data may be useful for:

```text
recent PWRC activity
wallet history
analytics
volume charts
instruction discovery
transaction-context lookup
```

It must not, by itself, authorize:

```text
wPWRC mint
PWRC release
Mainnet deployment
release authorization
authority revocation proof
canonical supply proof
```

Those actions continue to require finalized chain/RPC evidence and the existing
PowerChain release/bridge verification gates.
