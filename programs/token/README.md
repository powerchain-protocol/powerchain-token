# PWRC Token Verifier

**Canonical release:** `1.0.0`

Source program identity:

```text
PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

Canonical PWRC mint:

```text
PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
```

## Capability

The program is **verification-only**.

`verify_profile` verifies the canonical mint account, Token-2022 ownership,
9 decimals, exact fixed supply, revoked mint authority and disabled freeze
authority. After successful base-mint verification it emits `ProfileVerified`.

The verifier has no instruction for:

- minting;
- burning;
- transferring;
- custody/release;
- setting authorities.

Token-2022 extension decoding and reviewed transfer-fee authority verification
remain in the release/client verification layer.

## Build

When Rust/Anchor dependencies are available:

```bash
cargo fmt --check
cargo check -p pwrc-token
cargo test -p pwrc-token
anchor build --program-name pwrc_token
```

A successful source/static gate is not an Anchor build, deployment, or Mainnet
verification claim. Deployment identity requires the matching program keypair,
compiled artifact and independent RPC evidence.
