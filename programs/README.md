# PowerChain Solana Programs

**Version:** `1.0.0`

- `pwrc-token`: verification-only PWRC Token-2022 profile program.
- `pwrc-lock`: bridge state/lock/release authority boundary.

The verifier exposes no mint instruction. The canonical PWRC mint remains the
Token-2022 mint `PWRCRXX...G46wc`.

Strict deployment builds require program keypairs matching `declare_id!`.
Source IDs are not Mainnet deployment evidence.


## v29 security model

The Solana programs deliberately separate **verification/control-plane**
capabilities from monetary execution.

- `programs/token`: canonical PWRC verification only.
- `programs/pwrc-lock`: singleton bridge administration state only.

Neither program includes a PWRC mint, custody, release, or transfer instruction.

The bridge-admin singleton uses PDA seed `bridge-state`, starts paused, requires
separate governor/operator keys, and performs governor changes through
propose/accept semantics. Accepting a new governor forces the state back to
paused.

Source policy commitment:
`config/programs/policy.json`.
