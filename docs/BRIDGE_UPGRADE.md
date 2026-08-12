# PowerChain Bridge Upgrade

Version: `1.0.0`

This upgrade adds an explicit cross-chain transfer lifecycle:

```text
CREATED
→ SOURCE_SUBMITTED
→ SOURCE_FINALIZED
→ SOURCE_VERIFIED
→ DESTINATION_BUILT
→ DESTINATION_SIMULATED
→ DESTINATION_SUBMITTED
→ DESTINATION_FINALIZED
→ RECONCILED
→ COMPLETED
```

Any failed invariant enters `BLOCKED`.

## Solana -> Sui

A destination mint is only built after the Solana lock receipt is finalized
and verified.

The receipt must prove:

- canonical PWRC mint;
- configured bridge vault;
- exact amount in 9-decimal canonical base units;
- exact corresponding 6-decimal wrapped amount;
- transfer ID;
- Sui recipient;
- monotonic sequence;
- finalized slot;
- source transaction and instruction index.

## Sui -> Solana

The Sui burn helper creates an exact burn reference and binds a 32-byte Solana
destination. Release evidence is domain-separated and hashed before it is used
to authorize canonical release.

## Reconciliation

All backing checks normalize Sui supply to canonical units:

```text
canonical-equivalent wrapped supply =
wPWRC base units × 1000
```

The bridge is healthy only when effective wrapped exposure does not exceed
locked canonical PWRC.

## Retry policy

Retries are idempotent and reuse the same source receipt / burn reference.
A retry never creates a second logical destination mint or release.

Provider disagreement does not select a winner automatically. It enters manual
review / blocked state.
