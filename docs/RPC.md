# RPC Policy

PowerChain separates the primary Solana RPC, independent secondary verification
RPC, and WebSocket transport.

## Helius primary RPC

Helius is the preferred optional server-side provider for Devnet and Mainnet:

```env
HELIUS_ENABLED=true
HELIUS_API_KEY=
HELIUS_REQUEST_TIMEOUT_MS=10000
```

Network selection follows `PWRC_CLUSTER`:

```text
devnet        → Helius Devnet
mainnet-beta  → Helius Mainnet
localnet      → local validator; Helius is not used
```

When enabled, the resolver constructs the official Helius HTTPS and WSS endpoint
families. The API key stays server-side.

For production Mainnet, keep an independently operated/provider secondary RPC:

```env
NODE_ENV=production
PWRC_CLUSTER=mainnet-beta
HELIUS_ENABLED=true
HELIUS_API_KEY=
PWRC_RPC_URL_SECONDARY=
```

The primary and secondary endpoints must differ. Native PWRC multi-RPC
verification compares finalized observations and can bind them to a trusted
Solana genesis hash.

## Non-Helius fallback

Development may still configure:

```env
PWRC_RPC_URL=
PWRC_WS_URL=
PWRC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

Production Mainnet does not silently fall back to the public Solana endpoint.

## Sui

```env
SUI_MAINNET_RPC_URL=
SUI_RPC_URL_SECONDARY=
SUI_WS_URL=
```

The primary and secondary Sui RPCs must differ.

## Retry/write policy

Read operations may use bounded retries. Monetary writes are never blindly
retried after an unknown outcome; settlement state must be reconciled first.

See `docs/HELIUS.md`, `docs/NETWORKS.md`, and `docs/SECURITY.md`.


## Provider independence

A secondary verification RPC must differ by provider family, not merely by URL
or API key. For example, two `*.helius-rpc.com` endpoints are considered the
same provider family and are rejected for independent consensus.

Trusted network identity is configured separately:

```env
PWRC_SOLANA_DEVNET_GENESIS_HASH=
PWRC_SOLANA_MAINNET_GENESIS_HASH=
```

Helius health and configured native-PWRC attestation compare the observed
`getGenesisHash` value with the trusted configured value before accepting the
provider.


## Observation consistency windows

A native-PWRC observation is composed of several RPC reads, so PowerChain
records finalized `slotStart` before the read sequence and `slotEnd` afterward.
The resulting `slotSpan` is included in attestation evidence.

```env
PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW=128
```

Verification rejects slot regression or a span above the configured bound.
Independent provider observations are issued concurrently, but any configured
observer failure remains fail-closed.


### Helius response-size and cancellation safety

The Helius read client bounds successful JSON-RPC/DAS response bodies before
JSON parsing. The default limit is:

```text
HELIUS_MAX_RESPONSE_BYTES=2000000
```

Accepted configuration is 1 KiB through 10 MB. Responses whose declared
`Content-Length` exceeds the bound fail immediately, and bodies without a
trusted length are checked again after reading.

SDK read calls accept an optional `AbortSignal`. Caller cancellation is reported
as `PWRC_HELIUS_CANCELLED`; the client's own deadline remains
`PWRC_HELIUS_TIMEOUT`. Cancellation is not retried.

JSON-RPC request IDs are monotonically increasing within each client instance
instead of using a static ID. This improves request/response diagnostics without
exposing credentials or enabling writes.
