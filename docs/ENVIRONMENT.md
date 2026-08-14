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
PWRC_SERVICE_FEE_RECIPIENT=
```

The service fee is separate from PWRC's canonical Token-2022 transfer fee and
remains disabled unless explicitly enabled with a valid recipient.

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
