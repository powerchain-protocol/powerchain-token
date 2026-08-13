# PowerChain Bridge Relayer Security

Version: `1.0.0`

The relayer is intentionally fail-closed.

## Roles

```text
observer
  reads chain state

verifier
  validates finality, identities, receipts, amounts and conservation

submitter
  submits only a pre-authorized destination transaction

governor
  never lives inside the relayer
```

No AI worker or general service process may hold the bridge governor key.

## Idempotency

Every logical bridge operation has a deterministic key derived from its
direction and source-chain reference.

A source lock or source burn may produce at most one logical destination
operation.

If a submission result is ambiguous, the relayer checks destination
idempotency state before attempting another write. It does not blindly resend.

## Conservation watcher

Before destination submission and after destination finality, the watcher
verifies:

```text
effective wrapped exposure
<= locked canonical PWRC

effective wrapped exposure
<= live canonical PWRC supply
```

PWRC and wPWRC share the same 9-decimal base-unit domain. The relayer performs
no decimal scaling. Solana-to-Sui mint authorization uses the **net spendable PWRC**
credited to bridge backing after the native Token-2022 transfer fee.

Any conservation violation halts new bridge processing.

## Provider disagreement

External RPC providers are non-authoritative. The relayer requires independent
source observations where configured. Disagreement enters blocked/manual-review
state rather than automatically trusting one provider.

## Mainnet

Mainnet configuration remains blocked until separately verified Solana and Sui
program/package identities, vaults, operators, governors, and release evidence
are present.
