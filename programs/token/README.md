# PWRC Token Verifier

**Version:** `1.0.0`

Program source identity:

```text
PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

Canonical mint:

```text
PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
```

The program is **verification-only**. It has no mint instruction.

`verify_profile` checks the canonical mint address, Token-2022 program,
9 decimals, exact fixed supply, revoked mint authority, and disabled freeze
authority. Extension-specific release verification remains in the off-chain
release verifier because Anchor's token-interface Mint account represents the
common base mint structure.

## Build

```bash
anchor build --program-name pwrc_token
cargo test -p pwrc-token
```

Anchor 1.x IDL generation is enabled through the crate's `idl-build` feature.

A strict deployment build requires the private keypair whose public key matches
the program source identity. Do not commit that keypair.
