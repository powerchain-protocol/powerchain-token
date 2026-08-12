# `@powerchain/bridge-integration`

**Version:** `1.0.0`

Typed production integration and readiness helpers for the PWRC ↔ wPWRC bridge.
This package is designed for deterministic validation and fail-closed execution;
it does not hold private keys and does not authorize blind transaction retries.

## Canonical bridge policy

```text
Canonical asset:       PWRC / Solana Token-2022
Wrapped asset:         wPWRC / Sui
Decimals:              9 / 9
Base-unit factor:      1
PWRC transfer fee:     250 bps / 2.5%
Maximum transfer fee:  1,000,000 PWRC
wPWRC genesis supply:  0
```

## Fee-aware amounts

### Solana → Sui

The wrapped amount is the net spendable PWRC credited to bridge backing:

```text
wrapped_amount = gross_canonical_transfer - Token2022_transfer_fee
```

### Sui → Solana

The burned wPWRC amount is the gross canonical PWRC release amount:

```text
canonical_gross_release = wrapped_burn
recipient_net = canonical_gross_release - Token2022_transfer_fee
```

This keeps wPWRC backed by spendable canonical custody rather than fee-withheld
amounts.

## Integration responsibilities

The package provides typed helpers for:

- production network configuration;
- bridge finality/state transitions;
- source/destination identity validation;
- conservation/reconciliation checks;
- Mainnet evidence/blocker reporting;
- ABI/release policy integration.

External price/data providers are never authoritative for settlement.

## Mainnet evidence

Mainnet readiness must verify, rather than assume:

- canonical mint identity and Token-2022 ownership;
- fixed supply and mint/freeze authority state;
- transfer-fee configuration and authority custody;
- bridge program/vault identities;
- Sui package/controller/Coin type identities;
- zero wrapped genesis supply;
- governance/operator separation;
- generated IDL/ABI evidence.

## Safety

Ambiguous writes that may have landed must be reconciled before retrying.
Replay/idempotency keys must be persisted atomically with state changes.

See `docs/INTEGRATION.md`, `docs/BRIDGE_INTENT.md`, and
`docs/PRODUCTION_MAINNET.md` for the wider production flow.
