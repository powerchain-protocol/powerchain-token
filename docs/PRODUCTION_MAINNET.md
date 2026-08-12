# Production and Mainnet

Release states are distinct: static-ready, build-ready, deployment-ready, and Mainnet-ready.

Solana bridge initialization requires 9 decimals, exact genesis supply, revoked mint authority, null freeze authority, distinct operator/governor, and an empty canonical bridge vault. Mainnet preflight must separately verify that `TransferFeeConfig` is absent.

The Sui package creates zero wPWRC, wraps `TreasuryCap` in the shared controller, starts paused, and requires one-time authority configuration before unpause. OTW Currency registration must be finalized in CoinRegistry after publication. Production provenance must use an immutable reviewed Sui framework Git commit rather than a moving network branch.

The pinned Anchor line is `0.32.1`; the repository qualification target is Agave/Solana `2.3.0`.

## Authenticated bridge verifier

Mainnet stays blocked until the Solana release authority and Sui bridge authority are backed by a reviewed authenticated bridge/verifier design. A unique message hash prevents replay, but it is not a substitute for authenticating the cross-chain message source.
