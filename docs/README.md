# PowerChain Documentation

Version: `1.0.0`

Start here:

- `WPWRC_SPECIFICATION.md` — canonical PWRC → Sui wPWRC model
- `PROGRAMS.md` — on-chain program architecture
- `BRIDGE_INTENT.md` — bridge conservation and lifecycle
- `RELAYER_SECURITY.md` — fail-closed relayer policy
- `BURN_INTENT.md` — quarterly burn race protection
- `RELEASE_PROVENANCE.md` — release evidence commitments
- `SECURITY_MODEL.md` — security model
- `OFFICIAL_LINKS.md` — canonical PowerChain project links

## Sui RPC environments

| Network | RPC endpoint | Production |
|---|---|---:|
| testnet | `https://fullnode.testnet.sui.io:443` | |
| mainnet | `https://fullnode.mainnet.sui.io:443` | **✓** |
| devnet | `https://fullnode.devnet.sui.io:443` | |
| local | `http://127.0.0.1:9000` | |

Machine-readable configuration lives in `config/sui/networks.json`.

- `PRODUCTION_MAINNET.md` — production and Mainnet release gates
- `INTEGRATION.md` — bridge integration lifecycle
