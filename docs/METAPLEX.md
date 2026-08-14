# Metaplex Integration

**PowerChain version:** `1.0.0`

PowerChain keeps Metaplex integration in a dedicated workspace package:

```text
packages/metaplex/
├── package.json
└── src/
    └── index.ts
```

`@powerchain/sdk` depends on `@powerchain/metaplex` via `workspace:*`. The root
package and SDK do not duplicate Metaplex dependencies.

## Packages

Pinned package versions:

```text
@metaplex-foundation/mpl-token-metadata  3.4.0
@metaplex-foundation/umi                 1.5.1
@metaplex-foundation/umi-bundle-defaults 1.5.1
@metaplex-foundation/mpl-toolbox         0.11.4
```

Install the workspace dependency graph normally:

```bash
pnpm install
```

## Token Metadata program

The canonical Metaplex Token Metadata program is:

```text
metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
```

PowerChain pins it in:

```text
packages/protocol/src/constants.ts
config/metaplex.json
config/token.json
.env.example
```

Production drift checks fail if these values disagree.

## PWRC metadata

Canonical PWRC metadata:

```text
mint
PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc

metadata URI
https://token.powerchain.energy/metadata/metadata.json

image
https://token.powerchain.energy/assets/tokens/pwrc-logo.png
```

`@powerchain/metaplex` exposes Umi setup, metadata PDA derivation, and read-only
metadata fetching.

Canonical metadata mutation is deliberately **not** exposed. Updating canonical
metadata requires a separately authorized governance/deployment workflow.

## Token-2022 relationship

PWRC remains a Token-2022 asset using its canonical Token-2022 extensions.
Metaplex metadata support does not replace the Token-2022 `MetadataPointer` /
`TokenMetadata` profile or alter PWRC's mint, supply, decimals, or transfer-fee
policy.

## Package boundary

`@powerchain/metaplex` imports protocol metadata through the public workspace
subpath:

```ts
import {
  PWRC_METADATA,
} from "@powerchain/protocol/metadata";
```

It does not import `packages/protocol/src/*` through relative filesystem paths.
The `workspace:boundaries:check` gate prevents this layering violation from
returning.

## Public metadata endpoint

```text
GET /api/v1/metadata
```

The response exposes only canonical public identities and indicates that
canonical metadata mutation is not exposed by the API.
