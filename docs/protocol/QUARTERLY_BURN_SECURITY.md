# Quarterly Burn Security Controls

Version: `1.0.0`

The 2% quarterly PWRC burn is intentionally fail-closed.

## Timing

A quarter is measured in UTC calendar quarters. The burn executes only after
the quarter closes. The default execution grace window is 14 days.

The default policy does not perform automatic catch-up burns for missed
quarters. A missed window requires explicit governance review rather than
silently combining multiple burns.

## Full-target rule

The quarterly target is exactly:

```text
floor(current live canonical supply × 200 / 10,000)
```

A partial burn is not considered a successful quarterly burn. The controlled
burn source must be able to fund the full target before signing begins.

## Independent observations

At least two independent Solana observers using separate RPC endpoints must
agree on the exact live supply. Default observation age is at most 60 seconds
and the observed slots may differ by at most 32 slots.

This protects the burn planner from acting on a single stale or faulty RPC.

## Hash-chained journal

Each stage creates an immutable SHA-256 journal entry containing the hash of
the previous entry. Any edit, deletion or reordering breaks verification.

The final evidence package should preserve:

- plan SHA-256;
- every journal entry;
- journal head SHA-256;
- Solana burn transaction;
- finalized Solana slot;
- post-burn supply;
- Sui ceiling update digest;
- Sui checkpoint;
- reconciliation evidence.

## Mainnet

Mainnet burn execution must fail closed unless:

- canonical mint is verified;
- controlled burn source is configured;
- burn authority is multisig/threshold controlled;
- the source can fund the full 2% target;
- two independent Solana observers agree;
- prior-quarter evidence is verified;
- current quarter is not already executed;
- Sui bridge is paused;
- pre-burn Sui ceiling equals live Solana supply;
- post-burn Sui ceiling is reconciled to the finalized new Solana supply.

No scheduler holds or automatically uses private signing keys.
