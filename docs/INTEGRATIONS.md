# Solana and Sui Integrations

## Solana SDK

`packages/sdk/src/solana-client.ts` resolves:

- canonical PWRC mint;
- `pwrc_token` program;
- `pwrc_lock` program;
- primary RPC;
- secondary RPC;
- WebSocket endpoint.

`finalized` is the default read commitment for the integration client.

## Sui SDK

`packages/sdk/src/sui-client.ts` exposes transport configuration separately from
deployment identity. This avoids treating a public RPC or alias as proof that
wPWRC has been published.

`requireWpwrcDeployment()` requires:

```text
WPWRC_SUI_PACKAGE_ID
WPWRC_SUI_COIN_TYPE
WPWRC_SUI_BRIDGE_CONTROLLER_ID
```

and validates their relationship.

## Bridge SDK

`packages/sdk/src/bridge-integration.ts` combines the verified Solana and Sui
configuration boundaries but keeps canonical backing accounting in
`@powerchain/protocol`.

## Sui package

The Move `BridgeController`:

- starts paused;
- owns the wPWRC TreasuryCap;
- separates governor and operator;
- stores replay-protected Solana message keys;
- mints only through the operator path;
- burns user-supplied wPWRC before Solana release;
- emits bridge mint/burn events;
- caps current wrapped supply at the canonical maximum.

Actual cross-chain finality is verified off-chain/on the destination chain;
neither chain may trust a self-reported browser event.
