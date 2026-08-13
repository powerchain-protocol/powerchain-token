# Configuration

Configuration is versioned and fail-closed. Production code should read
canonical values from `config/` instead of duplicating token economics or
network policy.

## Registry

`config/registry.json` inventories primary production configuration.

| File | Registry ID | Required top-level keys |
|---|---|---|
| `config/token.json` | `token` | mint, decimals, transferFee |
| `config/bridge.json` | `bridge` | version |
| `config/runtime.json` | `runtime` | — |
| `config/transactions.json` | `transactions` | — |
| `config/handlers.json` | `handlers` | — |
| `config/rpc.json` | `rpc` | — |
| `config/production/policy.json` | `production-policy` | — |
| `config/operations/policy.json` | `operations-policy` | — |
| `config/mainnet/bridge.json` | `mainnet-bridge` | version, solana, sui, governance, policy |
| `config/apps.json` | `apps` | version, api, web |

Validate the registry with:

```bash
pnpm pwrc:config:registry-check
```

## Token

`config/token.json` is the canonical PWRC token definition.

Important values:

```text
mint              PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
decimals          9
genesis supply    18446000000
max supply        18446000000
fee bps           250
maximum fee       1000000 PWRC
freeze authority  null
```

Authority fields that require deployment evidence are intentionally not guessed.

## Bridge

`config/bridge.json` defines canonical/wrapped semantics.

The current file is a template for real cross-chain deployment identifiers.
Null package IDs, manager IDs or controller IDs must be replaced only from
verified deployments.

## Runtime

`config/runtime.json` defines general runtime behavior:

```text
RPC timeout                     10000 ms
Read attempts                   4
Read base delay                 250 ms
Read max delay                  4000 ms
Preflight commitment            confirmed
Confirmation commitment         finalized
Confirmation timeout            60000 ms
Maximum write attempts          1
Ambiguous write reconciliation  true
```

## Applications

`config/apps.json` owns API/web defaults. Environment variables may override
operational values, but they must not redefine canonical token economics.

## Mainnet

`config/mainnet/bridge.json` contains Mainnet deployment slots/identifiers and
verification flags.

`config/mainnet/evidence.example.json` is the deployment-evidence template.

`config/mainnet/release-authorization.example.json` is the short-lived release
authorization template.

Local populated evidence/authorization files are intentionally gitignored.

## Security configuration

`config/security/` defines source-level security policy and the expected
Token-2022 profile.

## Configuration rules

1. Keep version `1.0.0`.
2. Do not place private keys, seeds, mnemonics or secret tokens in versioned
   config files.
3. Do not invent deployment identifiers.
4. Keep token economics canonical across token, bridge and transaction configs.
5. Validate config changes with `pnpm production:check`.
6. Regenerate provenance after any release-affecting configuration change.
