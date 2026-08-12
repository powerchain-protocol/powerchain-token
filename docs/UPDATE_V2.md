# PowerChain Update v2

Version: `1.0.0`

This update strengthens burn persistence, unpause safety, deployment-manifest
validation, and Mainnet readiness reporting.

Each quarterly burn now persists a SHA-256 committed execution record linking
the burn plan, Sui burn intent, Solana finality evidence, Sui ceiling evidence,
and reconciliation state.

The Sui bridge may only be unpaused after Solana finality, exact supply match,
Sui ceiling finality, exact 1000:1 converted ceiling match, conservation,
cleared burn intent, and a reconciled execution record.

Mainnet readiness remains blocked until real verified deployment identities and
a dependency lockfile are present. Static repository checks do not count as an
on-chain deployment.
