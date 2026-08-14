# PowerChain Solana Programs

**Version:** `1.0.0`

- `pwrc-token`: verification-only PWRC Token-2022 profile program.
- `pwrc-lock`: bridge state/lock/release authority boundary.

The verifier exposes no mint instruction. The canonical PWRC mint remains the
Token-2022 mint `PWRCRXX...G46wc`.

Strict deployment builds require program keypairs matching `declare_id!`.
Source IDs are not Mainnet deployment evidence.
