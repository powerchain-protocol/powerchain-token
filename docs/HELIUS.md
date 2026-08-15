# Helius Integration

**PowerChain version:** `1.0.0`

PowerChain uses Helius as optional server-side Solana infrastructure for
Devnet and Mainnet Beta.

## Supported surfaces

```text
HTTPS JSON-RPC
WebSocket subscriptions
DAS API
```

PowerChain does not build new functionality on Helius Enhanced Transactions.
The integration uses standard Solana RPC and DAS for current read/data needs.

## Official endpoint families

PowerChain constructs the endpoint from the selected Solana network and
`HELIUS_API_KEY`.

```text
Mainnet RPC   https://mainnet.helius-rpc.com/?api-key=<server secret>
Devnet RPC    https://devnet.helius-rpc.com/?api-key=<server secret>

Mainnet WS    wss://mainnet.helius-rpc.com/?api-key=<server secret>
Devnet WS     wss://devnet.helius-rpc.com/?api-key=<server secret>
```

DAS JSON-RPC methods use the matching Helius RPC endpoint.

## Configuration

```env
HELIUS_ENABLED=false
HELIUS_API_KEY=
HELIUS_DEVNET_API_KEY=
HELIUS_MAINNET_API_KEY=
HELIUS_REQUEST_TIMEOUT_MS=10000
HELIUS_READ_RETRY_ATTEMPTS=4
HELIUS_READ_RETRY_BASE_DELAY_MS=250
HELIUS_READ_RETRY_MAX_DELAY_MS=4000
HELIUS_RATE_LIMIT_DELAY_MS=10000
```

For Devnet:

```env
PWRC_CLUSTER=devnet
HELIUS_ENABLED=true
HELIUS_DEVNET_API_KEY=<server-only-key>
```

For production Mainnet:

```env
NODE_ENV=production
PWRC_CLUSTER=mainnet-beta
HELIUS_ENABLED=true
HELIUS_MAINNET_API_KEY=<server-only-key>

# Keep an independent provider/endpoint for verification.
PWRC_RPC_URL_SECONDARY=
```

When Helius is enabled for Devnet/Mainnet, the PowerChain Solana resolver uses
Helius for the primary HTTPS RPC and WebSocket connection. An independently
configured secondary RPC is still used for multi-provider verification.

## Read-only SDK

```ts
import {
  createHeliusClient,
} from "@powerchain/sdk/helius";

const helius =
  createHeliusClient({
    apiKey:
      process.env.HELIUS_API_KEY!,
    network:
      "mainnet-beta",
  });

const supply =
  await helius.rpcRead(
    "getTokenSupply",
    [
      "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      {
        commitment:
          "finalized",
      },
    ],
  );

const asset =
  await helius.das(
    "getAsset",
    {
      id:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      displayOptions: {
        showFungible:
          true,
      },
    },
  );
```

The client allowlists read-only Solana RPC and DAS methods. `sendTransaction`,
minting, transfers and authority changes are not exposed by this integration.

## API

Sanitized integration state:

```text
GET /api/v1/integrations/helius
```

Canonical PWRC through Helius DAS:

```text
GET /api/v1/data/solana/pwrc/helius/asset
```

The status route exposes only booleans/network state. It never returns the API
key or a credential-bearing Helius URL.

## Production policy

- Helius credentials are server-only.
- Mainnet must use `mainnet-beta`; Devnet must use `devnet`.
- Localnet never routes through Helius.
- Multi-RPC token verification should retain an independent secondary endpoint.
- Native PWRC monetary/token writes are not routed through this Helius module.
- Provider errors and rate limits fail closed.
- Helius data does not replace PowerChain Mainnet build/deployment evidence.

## Checks

```bash
pnpm helius:check
pnpm native-token:attestation:check
pnpm native-token:consensus:check
pnpm native-token:observer:check
pnpm production:check
```


## Retry and provider health

Helius reads use bounded retries only. The default policy is:

```text
max attempts       4
base delay         250 ms
maximum delay      4000 ms
429 delay          10000 ms
request timeout    10000 ms
```

Only read-only RPC/DAS methods are eligible. No transaction submission method is
present in the Helius client, so retry policy cannot replay monetary writes.

Live preflight:

```text
GET /api/v1/integrations/helius/health
```

The health endpoint performs `getVersion`, `getGenesisHash`, and finalized
`getSlot`. It returns 503 on disabled, invalid, rate-limited, or unavailable
provider state and never exposes credentials.

Production Mainnet requires `HELIUS_MAINNET_API_KEY`; the generic
`HELIUS_API_KEY` is not accepted as the only key in `NODE_ENV=production`.
This prevents accidental reuse of a development credential in production.


## Native PWRC live attestation

Helius may serve as the primary Solana provider for native PWRC verification,
but it is not sufficient by itself. PowerChain requires an independently
classified secondary provider before the live native-token attestation endpoint
is considered configured.

```text
GET /api/v1/token/native-verification
GET /api/v1/token/native-attestation
```

The attestation path does not require deployed `pwrc_lock` or verifier program
IDs merely to construct RPC read connections. It reads the canonical Token-2022
mint directly and remains verification-only.


## Priority-fee estimation

`@powerchain/sdk/helius` supports `getPriorityFeeEstimate` for read-only
transaction planning. Callers may provide an unsigned serialized transaction
in Base64 or account keys. The default priority level is `Medium`.

Priority-fee estimation never submits the transaction. The resulting
micro-lamport recommendation can be fed into the unsigned PWRC transaction
builder before wallet signing.


## Shared rate-limit cooldown

Read-only Helius clients coordinate HTTP `429` handling across concurrent
requests on the same network. Any rate-limit response moves the shared cooldown
forward; new requests wait until the cooldown expires.

The minimum configured cooldown remains:

```env
HELIUS_RATE_LIMIT_DELAY_MS=10000
```

If Helius supplies a `Retry-After` response header, PowerChain honors the larger
delay, bounded to 60 seconds. Transient `408` and `5xx` responses use the
configured exponential retry policy.

Helius documents `429` as retryable and recommends backoff for transient
failures. PowerChain keeps all automatic retries limited to its read-only RPC,
DAS and priority-fee allowlists.

## Secret-safe client state

Credential-bearing URLs remain private inside `createHeliusClient()`. Returned
client objects expose safe endpoint-family/network metadata rather than raw
`?api-key=` URLs, and JSON serialization explicitly reports
`secretsExposed=false`.

## Health amplification protection

```env
HELIUS_HEALTH_CACHE_MS=15000
```

Health verification checks the configured genesis identity before issuing the
remaining version/slot calls. Successful results are cached briefly and
concurrent requests share one in-flight health operation.

The canonical PWRC DAS helper is limited to Mainnet because the canonical PWRC
mint is a Mainnet asset.


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
