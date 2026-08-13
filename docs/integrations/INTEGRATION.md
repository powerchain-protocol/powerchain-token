# Bridge Integration

`@powerchain/bridge-integration@1.0.0` provides typed production config, finality progression, conservation checks, and Mainnet blocker reporting.

```text
SOURCE_OBSERVED → SOURCE_FINALIZED → SOURCE_VERIFIED → DESTINATION_SIMULATED → DESTINATION_SUBMITTED → DESTINATION_FINALIZED → RECONCILED → COMPLETED
```

Provider disagreement, replay ambiguity, finality failure, or conservation mismatch blocks progression.
