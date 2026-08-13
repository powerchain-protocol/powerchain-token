# PowerChain Optimization Pass II

Version: `1.0.0`

This pass tightens deterministic execution and resource bounds.

## Deterministic evidence

Canonical JSON serialization now:

- sorts object keys;
- serializes bigint values as decimal strings;
- rejects non-finite numbers;
- supports SHA-256 evidence commitments.

## Replay isolation

Replay keys are bound to:

```text
PowerChain namespace
version
operation domain
network
source reference
```

A Testnet source reference can never collide with the same textual reference on
Mainnet, and Solana-lock references cannot collide with Sui-burn references.

## Queue backpressure

The relayer queue now has:

- explicit maximum capacity;
- duplicate-ID rejection;
- hard failure on overflow.

This prevents an unhealthy provider or event storm from creating unbounded
memory growth.

## Configuration parsing

Runtime integers and booleans are parsed strictly. Values such as `4.5`,
`yes`, `NaN`, or implicitly coerced strings are rejected.

## Bridge identity

A single bridge identity bundle validates:

- canonical Solana mint;
- Solana bridge program;
- Solana vault;
- Sui package;
- BridgeController;
- Currency object;
- coin type;
- 9/6 decimal policy.

The Solana System Program remains explicitly forbidden as a PowerChain
deployment identity.

## Account boundaries

Mutable flows can be checked against explicit account roles and must contain
both a signer and writable state boundary.
