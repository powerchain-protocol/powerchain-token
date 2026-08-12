# Devnet Readiness

Version `1.0.0`.

Devnet is configuration-ready but deployment identities remain evidence-bound. Run:

```bash
pnpm pwrc:devnet:status
pnpm pwrc:devnet:preflight
```

The status command reports missing Solana mint/program/vault and Sui package/controller identities. The preflight fails closed until those fields are populated from actual deployments.

Default development RPCs:

| Network | RPC |
|---|---|
| Solana devnet | `https://api.devnet.solana.com` |
| Sui testnet | `https://fullnode.testnet.sui.io:443` |
| Sui devnet | `https://fullnode.devnet.sui.io:443` |
| Sui local | `http://127.0.0.1:9000` |

Dedicated RPC endpoints are recommended for sustained testing.

## Build and deployment phases

Run the static prebuild before compiling contracts:

```bash
pnpm pwrc:devnet:prebuild
pnpm devnet:build
```

After devnet contracts are actually deployed, populate the devnet identity
fields and run `pnpm pwrc:devnet:preflight`. Missing deployment IDs remain a
blocked state rather than being replaced with localnet placeholders.
