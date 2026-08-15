# Environment Configuration

**Version:** `1.0.0`

PowerChain keeps configuration separate from secrets.

Start locally with:

```bash
cp .env.example .env
```

The committed `.env.example` contains safe defaults and blank placeholders
only. Do not commit real program/deployer keypairs, bearer tokens, mnemonics,
API keys, bridge executor credentials, or release-signing material.

## Solana

```env
PWRC_CLUSTER=localnet
PWRC_RPC_URL=http://127.0.0.1:8899
PWRC_RPC_URL_SECONDARY=
PWRC_WS_URL=
PWRC_MAINNET_RPC_URL=
```

Production Mainnet requires an explicit dedicated HTTPS RPC and independent
verification RPC. Mainnet program IDs remain blank until real deployment
evidence exists.


## Helius

Helius is optional server-side Solana infrastructure:

```env
HELIUS_ENABLED=false
HELIUS_API_KEY=
HELIUS_REQUEST_TIMEOUT_MS=10000
```

`HELIUS_API_KEY` must remain blank in committed templates and must never be
placed in public/browser environment variables. Devnet/Mainnet selection follows
`PWRC_CLUSTER`.

See `docs/HELIUS.md`.


## Solana trusted network identity

```env
PWRC_SOLANA_LOCALNET_GENESIS_HASH=
PWRC_SOLANA_DEVNET_GENESIS_HASH=
PWRC_SOLANA_MAINNET_GENESIS_HASH=
```

These values are network policy, not secrets. Keep them blank in generic
templates until independently reviewed for the target deployment. Do not copy
the expected value from the same RPC endpoint being verified.


## Native PWRC verification runtime

```env
PWRC_NATIVE_VERIFY_MIN_OBSERVERS=2
PWRC_NATIVE_VERIFY_MAX_AGE_MS=60000
PWRC_NATIVE_VERIFY_MAX_SLOT_SKEW=128
```

For Devnet/Mainnet live verification, Helius must be configured as the primary
provider, a trusted Solana genesis hash must be configured, and
`PWRC_RPC_URL_SECONDARY` must resolve to a different provider family.

## Sui

```env
SUI_NETWORK=devnet
SUI_RPC_URL=https://fullnode.devnet.sui.io:443
SUI_RPC_URL_SECONDARY=

WPWRC_SUI_PACKAGE_ID=
WPWRC_SUI_COIN_TYPE=
WPWRC_SUI_BRIDGE_CONTROLLER_ID=
WPWRC_SUI_METADATA_CAPABILITY_ID=
```

The configured `powerchain` alias/address is not a substitute for an actual
published package ID.

## Fees

```env
PWRC_SERVICE_FEE_ENABLED=false
PWRC_SERVICE_FEE_BPS=250
POWERCHAIN_TRANSACTION_FEE_SOLANA=FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy
POWERCHAIN_TRANSACTION_FEE_SUI=0xc23c9622a09c5533fd18f35703622dc2df44206749a1761202d2024a04a36f50
```

The service fee is separate from the bridge principal. Solana-source fees debit
PWRC to the Solana fee wallet; Sui-source fees debit wPWRC to the Sui fee
wallet. Neither fee reduces the 1:1 bridge principal.

## Bridge execution

```env
PWRC_BRIDGE_EXECUTION_ENABLED=false
PWRC_BRIDGE_EXECUTOR_URL=
PWRC_BRIDGE_EXECUTOR_API_KEY=
PWRC_BRIDGE_API_AUTH_TOKEN=
```

Bridge executor credentials are server-only.

## Coinbase CDP SQL API

```env
CDP_SQL_API_BEARER_TOKEN=
CDP_SQL_API_URL=https://api.cdp.coinbase.com/platform/v2/data/query/run
CDP_SQL_API_TIMEOUT_MS=10000
CDP_SQL_API_CACHE_MAX_AGE_MS=15000
```

These credentials must never be exposed by browser/client bundles.

## Release gates

Mainnet deployment, Sui publish, finalization, and authorization consumption
all default to disabled. Do not change those values in committed templates to
simulate release readiness.
## Environment coverage check

Run:

```bash
pnpm env:coverage:check
```

The check scans JavaScript/TypeScript runtime source for `process.env` access
and verifies that every referenced variable is represented in `.env.example`.
Credential-like keys such as bearer tokens, API keys, auth tokens, secrets and
keypair paths must remain blank in the safe template.

`.env.production` remains an explicitly fail-closed template: Mainnet program
IDs, RPC credentials, bridge executor credentials and release authorization
values are not populated automatically.

## CDP User Wallet frontend variables

```env
POWERCHAIN_CDP_USER_WALLET_ENABLED=false
POWERCHAIN_CDP_PROJECT_ID=
POWERCHAIN_CDP_APP_NAME=PowerChain
```

`POWERCHAIN_CDP_PROJECT_ID` is frontend project configuration. It is intentionally
separate from server-only CDP SQL credentials.

The CDP user-wallet config reads `Record<string, string | undefined>` variables
with bracket access so `noPropertyAccessFromIndexSignature` remains enabled.

## Server proxy variables

```env
POWERCHAIN_PROXY_ENABLED=false
POWERCHAIN_PROXY_ALLOWED_HOSTS=
POWERCHAIN_PROXY_TIMEOUT_MS=10000

POWERCHAIN_WS_PROXY_ENABLED=false
POWERCHAIN_WS_PROXY_ALLOWED_HOSTS=
POWERCHAIN_WS_HEARTBEAT_MS=30000
```

`apps/api/proxy.ts` is not an open HTTP endpoint. It is a server-side upstream
client utility. HTTP targets require an explicit host allowlist and HTTPS.
WebSocket targets require an explicit host allowlist and WSS.


## Token utility and expensive-route protection

```env
PWRC_EXPENSIVE_API_RATE_LIMIT=20
PWRC_UTILITY_MAX_REQUESTS_PER_MINUTE=
PWRC_UTILITY_MAX_CONCURRENT_JOBS=
PWRC_UTILITY_MAX_PAYLOAD_BYTES=
PWRC_UTILITY_MAX_WORK_UNITS=
PWRC_NATIVE_ATTESTATION_CACHE_MS=15000
```

Utility compute thresholds are intentionally left blank in generic templates
and should be set by deployment policy. Missing utility limits report a
fail-closed utility policy state.


## Native observation consistency

```env
PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW=128
```

Maximum allowed finalized-slot span between the first and last RPC read used to
construct one native-PWRC observation. This is an operational consistency bound
and may be tightened for production provider characteristics.


## Native attestation epoch skew

```env
PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW=1
```

Maximum accepted epoch difference across native-PWRC observers. The default
permits the same epoch or one adjacent boundary.


## Native Token-2022 transfer-fee authorities

```env
PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED=
PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED=
```

For Devnet/Mainnet live native verification these must be configured with either
the reviewed Base58 Solana authority address or literal `null` if the authority
is expected to be revoked.


## Mainnet native-token evidence freshness

```env
PWRC_MAINNET_NATIVE_ATTESTATION_MAX_AGE_MS=3600000
```

Maximum age of the live native-PWRC attestation accepted by the Mainnet release
gate. Allowed verifier range is 60 seconds through 24 hours; the default is one
hour.


## Helius health cache

```env
HELIUS_HEALTH_CACHE_MS=15000
```

TTL for successful Helius health results. Allowed range is `0..60000` ms.
`0` disables result caching while in-flight coalescing remains available.
