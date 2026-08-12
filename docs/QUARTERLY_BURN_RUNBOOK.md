# PWRC Quarterly Burn Runbook

Version: `1.0.0`

Sui identity:

```text
alias:   powerchain
address: 0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1
```

## Safety model

A quarterly burn is a coordinated cross-chain state transition, not a cron
job that signs tokens automatically.

The canonical burn is executed on Solana. Sui only lowers the maximum live
canonical-supply ceiling used by the wPWRC bridge.

## Required states

```text
PLANNED
→ PRECHECKED
→ SOLANA_SIMULATED
→ SOLANA_SUBMITTED
→ SOLANA_FINALIZED
→ SUI_BRIDGE_PAUSED
→ SUI_CEILING_SUBMITTED
→ SUI_CEILING_FINALIZED
→ RECONCILED
→ COMPLETED
```

Any safety failure enters `BLOCKED`.

## Quarterly identity

Each burn uses a monotonic quarter ID.

```text
2026 Q1 = 20261
2026 Q2 = 20262
2026 Q3 = 20263
2026 Q4 = 20264
```

The Sui controller records:

- last completed quarter ID;
- every processed canonical burn evidence hash.

It rejects repeated evidence and non-increasing quarter IDs.

## Execution

1. Read finalized Solana PWRC live supply.
2. Calculate `floor(live_supply × 2 / 100)`.
3. Verify the controlled burn source can fund that exact amount.
4. Capture Solana slot and Sui checkpoint.
5. Verify wrapped exposure and locked backing.
6. Build immutable burn plan + SHA-256.
7. Simulate Token-2022 `BurnChecked`.
8. Obtain explicit signer/multisig authorization.
9. Submit and wait for finalized Solana confirmation.
10. Verify observed supply equals expected post-burn supply.
11. Pause the Sui bridge.
12. Build the Sui ceiling-lowering transaction using the same quarter ID and
    burn evidence hash.
13. Simulate, sign and finalize it.
14. Verify Sui ceiling equals the new Solana live supply.
15. Re-run bridge conservation checks.
16. Unpause only after reconciliation.
17. Persist final evidence.

## Fail-closed relayer behavior

wPWRC relayers must compare the live Solana canonical supply with the Sui
controller's canonical ceiling before every mint. If they differ, minting is
blocked until reconciliation completes.

This prevents a stale relayer from minting against a pre-burn supply ceiling.

## Additional production controls

Before `PRECHECKED`, verify the UTC post-quarter execution window and require
independent Solana supply consensus from at least two distinct RPC endpoints.

Every state transition is written to a SHA-256 hash-chained journal. A partial
burn, over-burn, stale observation, duplicate quarter, broken history chain or
observer disagreement moves the operation to `BLOCKED`.

Run the environment-level Mainnet gate with:

```bash
pnpm pwrc:burn:mainnet-readiness
```

## Policy start

The burn program starts with **2027 Q1**:

```text
quarter:     2027 Q1
quarter ID:  20271
sequence:    1
quarter end: 2027-04-01T00:00:00Z
```

With the default 14-day post-quarter grace window, Q1 2027 may execute from
2027-04-01 through 2027-04-14 UTC. Earlier quarter IDs are invalid.

The first burn cannot be backdated to a 2026 quarter, and later burns must
follow the configured quarter sequence.
