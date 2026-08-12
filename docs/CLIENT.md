# PWRC TypeScript Client

`client/client.ts` is the read/verification integration layer for PWRC 1.0.0.

## Compatibility

The requested compatibility stack is pinned to:

- `@coral-xyz/anchor` 0.32.1
- `@solana/web3.js` 1.98.4
- `bs58` 6.0.0
- `axios` 1.19.0

Anchor 1.0 renamed the TypeScript client package to `@anchor-lang/core`. PWRC keeps
`@coral-xyz/anchor` only as a compatibility/test client and does not make its
Token-2022 deployment scripts depend on Anchor.

## Responsibilities

The client provides:

- AnchorProvider construction for existing Anchor-compatible integrations.
- Solana RPC `Connection` with finalized commitment by default.
- Read-only JSON-RPC transport through Axios.
- Token-2022 mint snapshots and canonical PWRC validation.
- Finalized transaction evidence retrieval.
- Base58/JSON keypair decoding helpers for local tooling.

It intentionally does **not** broadcast deployment transactions through Axios and
contains no automatic write retry behavior. Mainnet writes stay inside the guarded
PWRC deployment/finalization workflow.

## Example

```ts
import { PWRCClient } from "../client/client.js";

const client = new PWRCClient({
  cluster: "devnet",
  rpcUrl: process.env.PWRC_RPC_URL,
});

const health = await client.getHealth();
const result = await client.verifyCanonicalMint(process.env.PWRC_MINT!, {
  requireFinalized: true,
});

if (!result.verified) {
  throw new Error(result.errors.join(","));
}
```

## Signer safety

Do not put base58 secret keys in source code, Git, logs, or browser bundles.
`loadKeypairFile()` is intended for secure local/server tooling only. Production
multisig or hardware-wallet signing should remain outside this helper.
