# RPC Policy

PowerChain separates primary RPC, secondary verification RPC and optional
WebSocket configuration.

## Solana

Development defaults:

```text
Localnet  http://127.0.0.1:8899
Devnet    https://api.devnet.solana.com
```

Production Mainnet does not silently use the public endpoint. Supply a dedicated
HTTPS endpoint through:

```env
PWRC_MAINNET_RPC_URL=
PWRC_RPC_URL_SECONDARY=
PWRC_WS_URL=
```

The primary and secondary RPC URLs must differ.

Use:

```bash
pnpm rpc:check:solana:devnet
```

for a basic JSON-RPC reachability/version check.

## Sui

Development defaults are stored in `config/networks.json`.

Production:

```env
SUI_MAINNET_RPC_URL=
SUI_RPC_URL_SECONDARY=
SUI_WS_URL=
```

The Sui primary and secondary RPCs must also differ.

Use:

```bash
pnpm rpc:check:sui:devnet
```

for a basic chain-identifier check.

## Write policy

Read operations may use bounded retries.

Monetary writes are submitted once. A timeout/unknown result is reconciled by
transaction signature, digest or operation ID before another write can be
attempted.
