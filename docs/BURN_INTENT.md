# Quarterly Burn Intent

Version: `1.0.0`

The quarterly burn path is now protected against the cross-chain timing gap
between a canonical Solana supply burn and the Sui wrapped-supply ceiling.

## Required order

```text
PLANNED
→ PRECHECKED
→ SUI_BRIDGE_PAUSE_SUBMITTED
→ SUI_BRIDGE_PAUSED
→ SUI_BURN_INTENT_SUBMITTED
→ SUI_BURN_INTENT_FINALIZED
→ SOLANA_SIMULATED
→ SOLANA_SUBMITTED
→ SOLANA_FINALIZED
→ SUI_CEILING_SUBMITTED
→ SUI_CEILING_FINALIZED
→ RECONCILED
→ COMPLETED
```

The Solana burn is forbidden until the Sui bridge is paused and the quarter's
burn intent has finalized on Sui.

## Intent binding

The intent commits to:

- quarter ID;
- burn ID;
- canonical mint;
- pre-burn canonical supply;
- exact target burn;
- expected post-burn canonical supply;
- expected 6-decimal Sui ceiling;
- Solana observation slot;
- Sui checkpoint;
- immutable plan SHA-256.

The expected Sui ceiling is derived from the post-burn canonical supply using
the fixed 1000:1 base-unit conversion.

## Cancellation

A staged intent may be cancelled only while the bridge remains paused and
before the canonical Solana burn is submitted. Once the canonical burn has
been submitted, operational policy forbids cancellation; the system must
complete reconciliation or remain blocked.

## Unpause

The bridge is not unpaused until:

1. Solana burn is finalized;
2. observed canonical supply matches the plan;
3. Sui ceiling update is finalized;
4. Sui ceiling matches converted canonical supply;
5. cross-chain conservation passes.
