# GitHub Repository Naming

**Version:** `1.0.0`

## Recommended repository name

Use:

```text
powerchain-token
```

A suitable full slug is:

```text
powerchain-ai/powerchain-token
```

only if `powerchain-ai` is the actual GitHub organization that owns the
repository. The owner segment must be verified before publishing repository
metadata or changing remotes.

## Why `powerchain-token`

PWRC and its cross-chain infrastructure are the canonical center of this
monorepo. It includes Token-2022 policy, wPWRC bridge logic, Solana programs,
Sui Move contracts, API, browser client, documentation, SDK/runtime packages
and release verification tooling.

## Client application vs reusable clients

Runnable browser application:

```text
apps/client/
```

Reusable blockchain/client libraries:

```text
packages/sdk/
packages/native-token-client/
```

`apps/` should contain runnable deployment units. `packages/` should contain
reusable libraries. Moving the browser client to `apps/client` therefore makes
the workspace clearer without incorrectly moving reusable SDK code out of
`packages/`.

## Alternatives

Use `powerchain-core` only if this becomes the canonical repository for all
PowerChain core infrastructure beyond PWRC.

Use `powerchain-protocol` if API/client/docs are later separated and this
repository becomes primarily protocol, contracts and release tooling.
