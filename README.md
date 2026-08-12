# PowerChain (PWRC) 1.0.0

Production-oriented source, client, bridge, validation, and deployment-evidence workspace.

## Canonical profile

```text
PWRC:   Solana mainnet-beta / Token-2022 / 9 decimals
Mint:   PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Supply: 18,446,000,000 PWRC fixed genesis/max
Fee:    250 bps (2.5%), max 1,000,000 PWRC
wPWRC:  Sui / 9 decimals / zero genesis / bridge-only
Ratio:  1 PWRC = 1 wPWRC = identical base-unit amount
```

Canonical Token-2022 requires `TransferFeeConfig`, `MetadataPointer`, and `TokenMetadata`. Mint authority is revoked after verified genesis and freeze authority is null.

## Sui capability model

`TreasuryCap<WPWRC>` is wrapped inside the shared `BridgeController`; it is not transferred to an operator/publisher address. The controller starts paused and unconfigured. Bridge minting requires the configured bridge authority and an unconsumed source-message hash. Sui burns use independent permanent burn-reference replay protection.

The `powerchain` address alias remains configuration identity only, not a package ID without deployment evidence.

## Sui RPCs

| Network | RPC |
|---|---|
| testnet | `https://fullnode.testnet.sui.io:443` |
| mainnet | `https://fullnode.mainnet.sui.io:443` |
| devnet | `https://fullnode.devnet.sui.io:443` |
| local | `http://127.0.0.1:9000` |

## Workspace

```text
programs/pwrc-lock/                 active bridge Anchor program
programs/token/                     canonical PWRC verifier
contracts/wpwrc/                    active Sui Move package
packages/native-token-client/       chain client helpers
packages/bridge-integration/        production integration/readiness helpers
```

`programs/pwrc-fees` is deprecated source only.

## Production checks

```bash
pnpm production:check
```

When workspace dependencies are installed:

```bash
pnpm production:build
```

Chain builds are explicit:

```bash
pnpm production:build:solana
pnpm production:build:sui
```

The repository pins Anchor `0.32.1`; its reviewed Agave/Solana qualification target is `2.3.0`. Other toolchains require requalification.

## Mainnet

```bash
pnpm pwrc:mainnet:status
pnpm pwrc:mainnet:preflight
```

Mainnet is fail-closed until verified canonical mint, Solana bridge program/vault, immutable Sui framework revision, Sui package/Currency/controller, governance separation, and post-deployment evidence are installed. IDs are never fabricated.

## Conservation

```text
PWRC_locked = wPWRC_circulating + pending_Solana_to_Sui + pending_Sui_to_Solana
```

Both chains use the same 9-decimal base-unit domain. Both pending amounts are nonnegative: locked-but-not-yet-minted for Solana → Sui, and burned-but-not-yet-released for Sui → Solana.

## Provenance

```bash
pnpm pwrc:release:provenance
```

Static checks and source hashes are evidence, not proof of an on-chain build or deployment.

## IDL

Contract interfaces are centralized under `/idl`.

```bash
pnpm idl:check
pnpm idl:hash
pnpm idl:build
pnpm idl:sync
```

The expected Anchor interface is checked in; generated Anchor IDL is only synced
after a real toolchain build. See `idl/README.md` and `docs/IDL.md`.

## Canonical token verifier program

`programs/token/` now contains the canonical PWRC Token-2022 verification
program and invariant helpers.

```bash
pnpm token:check
pnpm token:manifest:check
pnpm idl:token:check
```

The verifier exposes no mint instruction and does not create additional supply. It validates the canonical 250 bps Token-2022 fee profile.
See `docs/TOKEN_PROGRAM.md`.


## Canonical metadata

```text
Mint:       PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Metadata:   https://powerchain.energy/metadata/metaplex.json
Program:    Token-2022
Fee:        250 bps / 2.5%
Fee cap:    1,000,000 PWRC
```

`metadata/metaplex.json` is the canonical metadata descriptor supplied for
PWRC. Mainnet mint state is still verified independently against on-chain
Token-2022 state before release readiness can pass.

## Token images and metadata

```text
public/assets/pwrc.png
public/assets/wpwrc.png
```

Canonical metadata:

```text
https://powerchain.energy/metadata/metaplex.json
https://token.powerchain.energy/metadata/metadata.json
```

PowerChain links: `powerchain.energy`, `bridge.powerchain.energy`, and
`app.powerchain.energy`. See `docs/TOKEN_ASSETS.md`.
