# `pwrc-fees` — Deprecated Custom Fee Router

**Version:** `1.0.0`

This directory is retained for historical/source compatibility only. It is not
part of the canonical PWRC deployment path.

## Canonical fee policy

PowerChain PWRC **does use** Token-2022 `TransferFeeConfig`:

```text
Transfer fee:          250 bps / 2.5%
Maximum transfer fee:  1,000,000 PWRC
```

The fee is implemented natively by the canonical Token-2022 mint. Therefore a
second custom transfer-fee router program is unnecessary and would create an
undesired additional fee layer.

## Deployment status

`pwrc-fees` is deprecated and should remain excluded from the active Cargo
workspace/Anchor deployment map for the canonical `1.0.0` release.

Do **not** interpret this deprecation as meaning PWRC has no transfer fee. It
means the native Token-2022 fee replaces the older custom-router approach.

The current fee policy is enforced by:

```text
config/token.json
config/fees.json
config/security/token2022-profile.json
programs/token/
packages/native-token-client/
programs/pwrc-lock/
```
