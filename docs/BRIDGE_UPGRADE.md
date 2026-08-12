# PowerChain Bridge Upgrade

Version: `1.0.0`

PowerChain uses a common 9-decimal base-unit domain for canonical PWRC on
Solana and wrapped wPWRC on Sui. Solana Token-2022 transfer fees are accounted
for at the bridge boundary.

## Transfer lifecycle

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

Any failed identity, finality, replay, amount, authority, simulation, or
conservation invariant enters `BLOCKED`.

## Solana → Sui

A destination mint is built only after the Solana lock receipt is finalized and
verified. The receipt binds:

- canonical PWRC mint;
- configured bridge vault;
- gross PWRC transfer amount;
- native Token-2022 transfer fee;
- net spendable PWRC credited as bridge backing;
- equal wPWRC mint amount in the same 9-decimal base-unit domain;
- transfer ID and Sui recipient;
- monotonic sequence;
- finalized slot;
- source transaction and instruction index.

```text
gross PWRC transferred
- Token-2022 transfer fee
= net bridge backing
= wPWRC minted
```

## Sui → Solana

The Sui burn binds a unique burn reference and a 32-byte Solana destination.
The amount burned is the gross canonical PWRC release amount. The final Solana
Token-2022 transfer applies the configured transfer fee, so the recipient may
receive less than the gross release amount.

```text
wPWRC burned
= gross PWRC released

gross PWRC released
- Token-2022 transfer fee
= net recipient amount
```

## Reconciliation

No decimal conversion is performed. Effective wrapped exposure is evaluated in
9-decimal base units:

```text
exposure =
  wPWRC circulating
  + pending Solana→Sui
  + pending Sui→Solana

exposure <= net spendable PWRC bridge backing
```

Pending Sui→Solana remains exposure after the wrapped burn and until canonical
release finalizes.

## Retry policy

Reads may use bounded retry/backoff. Monetary writes are never blindly retried.
Ambiguous submission outcomes are reconciled by transaction signature and
replay/idempotency state before any new write is authorized.

Provider disagreement enters blocked/manual-review state rather than selecting
a provider as authoritative by default.
