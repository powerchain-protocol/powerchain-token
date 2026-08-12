# pwrc-lock

Active PowerChain Anchor bridge program, version `1.0.0`.

The program escrows canonical 9-decimal PWRC on Solana and releases escrow only
through a unique Sui burn-reference receipt.

Initialization requires:

- Token-2022 mint;
- exactly 9 decimals;
- exact verified genesis supply at bridge initialization;
- revoked mint authority;
- null freeze authority;
- no `TransferFeeConfig`;
- empty canonical bridge vault;
- distinct non-default operator and governor.

The bridge starts paused. Lock and release amounts are identical to wPWRC base
units because both assets use 9 decimals. Release evidence binds a burn
reference, Sui transaction digest, checkpoint, amount, and authenticated
recipient owner.

Authority rotation is two-step and pause-gated, with explicit cancellation.

```bash
anchor build --program-name pwrc_lock
cargo test -p pwrc-lock
```

The local program ID in `Anchor.toml` is development-only. Mainnet IDs remain
unset until independently built, deployed, executable-account verified, and
release-attested.
