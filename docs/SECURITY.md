# Security Boundaries

- Canonical token policy is checked for drift across JSON configuration,
  protocol constants and program source.
- Solana deployment IDs cannot be System, Token, Token-2022, Associated Token
  or Metaplex metadata program IDs.
- Mainnet program IDs are explicit; the Localnet bridge-lock ID never falls
  through to Mainnet.
- Mainnet primary and secondary RPCs must differ.
- Sui aliases are not deployment evidence.
- wPWRC starts at zero supply and is minted only through bridge-controller
  authority with replay-protected source messages.
- Monetary writes are single-attempt and reconciled after ambiguity.
- Service fees remain separate from bridge principal/backing.
- Private program/deployer keypairs and API secrets are excluded by `.gitignore`.
- Release evidence and authorization are separate gates.


## Release authorization consumption

Authorization and consumption are separate security events. A valid
authorization cannot be reused implicitly: the release workflow produces a
one-time receipt using create-exclusive file semantics and binds it to the exact
authorization, evidence and build manifest.

This makes the final release state explicit and auditable instead of treating
the mere presence of an authorization JSON file as sufficient.

## Coinbase CDP SQL trust boundary

Coinbase CDP SQL API is treated as a read-only analytics/indexing dependency.
Its server-side Bearer credential is never referenced by browser source, and
clients cannot submit arbitrary SQL.

CDP indexed results may support history, analytics and discovery, but they
cannot independently authorize wPWRC minting, canonical PWRC release, program
deployment, mint-authority claims, supply claims, or Mainnet release state.
Those decisions continue to use finalized chain/RPC evidence and PowerChain's
release verification gates.

The CDP endpoint is pinned to `api.cdp.coinbase.com` over HTTPS to prevent a
configuration error from forwarding the Bearer credential to an arbitrary
host.
